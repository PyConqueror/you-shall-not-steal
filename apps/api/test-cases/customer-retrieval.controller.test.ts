import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { FastifyReply, FastifyRequest } from "fastify";

import {
  confirmCustomerRetrieval,
  lookupCustomerRetrieval,
} from "../src/controllers/customer-retrieval.controller";
import type {
  ConfirmCustomerRetrievalRequest,
  CustomerRetrievalLookupRequest,
} from "../src/schemas/customer-retrieval";
import {
  activeAgent,
  occupiedLocker,
  retrievedPackage,
  storedPackage,
} from "./fixtures";
import {
  mockedAgentsCollection,
  mockedLockersCollection,
  mockedPackagesCollection,
} from "./mock-type";
import {
  createMockReply,
  createMockRequest,
  expectAppError,
  setupModelMocks,
} from "./test-helpers";
import { LOCKER_STATUS, PACKAGE_STATUS } from "../src/types/enum";

describe("customer-retrieval controller", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    setupModelMocks();
    mockRequest = createMockRequest();
    mockReply = createMockReply();
  });

  const lookupBody = {
    lockerId: "l004",
    pickupCode: "123456",
  };

  describe("lookupCustomerRetrieval", () => {
    test("should return package, locker, and charge preview on success", async () => {
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(occupiedLocker),
      );
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve(storedPackage),
      );
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockRequest.body = lookupBody;

      await lookupCustomerRetrieval(
        mockRequest as FastifyRequest<{ Body: CustomerRetrievalLookupRequest }>,
        mockReply as FastifyReply,
      );

      expect(mockReply.send).toHaveBeenCalledTimes(1);
      const response = (mockReply.send as ReturnType<typeof mock>).mock
        .calls[0][0];
      expect(response.package).toMatchObject({
        packageId: storedPackage.packageId,
        pickupCode: "123456",
        status: PACKAGE_STATUS.STORED,
      });
      expect(response.locker).toMatchObject({
        lockerId: "L004",
        status: LOCKER_STATUS.OCCUPIED,
      });
      expect(response.chargePreview).toMatchObject({
        chargeableDays: expect.any(Number),
        totalAmount: expect.any(Number),
      });
    });

    test("should throw INVALID_LOCKER_OR_PICKUP_CODE when locker is not found", async () => {
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = lookupBody;

      await expectAppError(
        lookupCustomerRetrieval(
          mockRequest as FastifyRequest<{ Body: CustomerRetrievalLookupRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "INVALID_LOCKER_OR_PICKUP_CODE",
          statusCode: 404,
        },
      );
    });

    test("should throw INVALID_LOCKER_OR_PICKUP_CODE when package is not found", async () => {
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(occupiedLocker),
      );
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = lookupBody;

      await expectAppError(
        lookupCustomerRetrieval(
          mockRequest as FastifyRequest<{ Body: CustomerRetrievalLookupRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "INVALID_LOCKER_OR_PICKUP_CODE",
          statusCode: 404,
        },
      );
    });

    test("should throw LOCKER_STATE_MISMATCH when locker state does not match package", async () => {
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve({
          ...occupiedLocker,
          currentPackageId: null,
        }),
      );
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve(storedPackage),
      );
      mockRequest.body = lookupBody;

      await expectAppError(
        lookupCustomerRetrieval(
          mockRequest as FastifyRequest<{ Body: CustomerRetrievalLookupRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "LOCKER_STATE_MISMATCH",
          statusCode: 409,
        },
      );
    });

    test("should throw PACKAGE_REFERENCE_ERROR when agent is missing", async () => {
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(occupiedLocker),
      );
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve(storedPackage),
      );
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = lookupBody;

      await expectAppError(
        lookupCustomerRetrieval(
          mockRequest as FastifyRequest<{ Body: CustomerRetrievalLookupRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "PACKAGE_REFERENCE_ERROR",
          statusCode: 500,
        },
      );
    });
  });

  describe("confirmCustomerRetrieval", () => {
    test("should retrieve package and release locker on success", async () => {
      const retrievedAt = "2026-07-01T12:00:00.000Z";
      const updatedPackage = {
        ...storedPackage,
        status: PACKAGE_STATUS.RETRIEVED,
        retrievedAt,
        chargeableDays: 5,
        storageChargeAmount: 10,
      };
      const releasedLocker = {
        ...occupiedLocker,
        status: LOCKER_STATUS.AVAILABLE,
        currentPackageId: null,
      };

      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(occupiedLocker),
      );
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve(storedPackage),
      );
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockedPackagesCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(updatedPackage),
      );
      mockedLockersCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(releasedLocker),
      );
      mockRequest.body = lookupBody;

      await confirmCustomerRetrieval(
        mockRequest as FastifyRequest<{ Body: ConfirmCustomerRetrievalRequest }>,
        mockReply as FastifyReply,
      );

      expect(mockReply.send).toHaveBeenCalledTimes(1);
      const response = (mockReply.send as ReturnType<typeof mock>).mock
        .calls[0][0];
      expect(response.package.status).toBe(PACKAGE_STATUS.RETRIEVED);
      expect(response.locker.status).toBe(LOCKER_STATUS.AVAILABLE);
    });

    test("should throw INVALID_LOCKER_OR_PICKUP_CODE when locker is not found", async () => {
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = lookupBody;

      await expectAppError(
        confirmCustomerRetrieval(
          mockRequest as FastifyRequest<{ Body: ConfirmCustomerRetrievalRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "INVALID_LOCKER_OR_PICKUP_CODE",
          statusCode: 404,
        },
      );
    });

    test("should throw PACKAGE_ALREADY_RETRIEVED when package was already retrieved", async () => {
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(occupiedLocker),
      );
      mockedPackagesCollection.findOne
        .mockImplementationOnce(() => Promise.resolve(null))
        .mockImplementationOnce(() => Promise.resolve(retrievedPackage));

      mockRequest.body = {
        lockerId: "l004",
        pickupCode: "654321",
      };

      await expectAppError(
        confirmCustomerRetrieval(
          mockRequest as FastifyRequest<{ Body: ConfirmCustomerRetrievalRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "PACKAGE_ALREADY_RETRIEVED",
          statusCode: 409,
        },
      );
    });

    test("should throw INVALID_LOCKER_OR_PICKUP_CODE when stored package is not found", async () => {
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(occupiedLocker),
      );
      mockedPackagesCollection.findOne
        .mockImplementationOnce(() => Promise.resolve(null))
        .mockImplementationOnce(() => Promise.resolve(null));

      mockRequest.body = {
        lockerId: "l004",
        pickupCode: "999999",
      };

      await expectAppError(
        confirmCustomerRetrieval(
          mockRequest as FastifyRequest<{ Body: ConfirmCustomerRetrievalRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "INVALID_LOCKER_OR_PICKUP_CODE",
          statusCode: 404,
        },
      );
    });

    test("should throw LOCKER_STATE_MISMATCH when locker state does not match before update", async () => {
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve({
          ...occupiedLocker,
          currentPackageId: null,
        }),
      );
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve(storedPackage),
      );
      mockRequest.body = lookupBody;

      await expectAppError(
        confirmCustomerRetrieval(
          mockRequest as FastifyRequest<{ Body: ConfirmCustomerRetrievalRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "LOCKER_STATE_MISMATCH",
          statusCode: 409,
        },
      );
    });

    test("should rollback package and throw LOCKER_STATE_MISMATCH when locker release fails", async () => {
      const updatedPackage = {
        ...storedPackage,
        status: PACKAGE_STATUS.RETRIEVED,
        retrievedAt: "2026-07-01T12:00:00.000Z",
      };

      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(occupiedLocker),
      );
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve(storedPackage),
      );
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockedPackagesCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(updatedPackage),
      );
      mockedLockersCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = lookupBody;

      await expectAppError(
        confirmCustomerRetrieval(
          mockRequest as FastifyRequest<{ Body: ConfirmCustomerRetrievalRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "LOCKER_STATE_MISMATCH",
          statusCode: 409,
        },
      );

      expect(mockedPackagesCollection.updateOne).toHaveBeenCalled();
    });

    test("should throw INVALID_LOCKER_OR_PICKUP_CODE on update race", async () => {
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(occupiedLocker),
      );
      mockedPackagesCollection.findOne
        .mockImplementationOnce(() => Promise.resolve(storedPackage))
        .mockImplementationOnce(() => Promise.resolve(null));
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockedPackagesCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = lookupBody;

      await expectAppError(
        confirmCustomerRetrieval(
          mockRequest as FastifyRequest<{ Body: ConfirmCustomerRetrievalRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "INVALID_LOCKER_OR_PICKUP_CODE",
          statusCode: 404,
        },
      );
    });
  });
});
