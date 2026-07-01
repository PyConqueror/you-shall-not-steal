const mockGenerateUniquePickupCode = mock(() => Promise.resolve("123456"));

import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";

import {
  dropOffPackage,
  getLockersAvailability,
  updateAgentDropoffTime,
} from "../src/controllers/agent-dropoff.controller";
import type {
  AgentDropoffLockersQuery,
  ConfirmAgentDropoffRequest,
  UpdateAgentDropoffTimeRequest,
} from "../src/schemas/agent-dropoff";
import {
  activeAgent,
  allAvailableLockers,
  occupiedLocker,
  smallLocker,
  storedPackage,
} from "./fixtures";
import {
  mockFindToArray,
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
import { LOCKER_STATUS, PACKAGE_SIZE, PACKAGE_STATUS } from "../src/types/enum";
import * as lockerUtil from "../src/utils/locker.util";

describe("agent-dropoff controller", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    setupModelMocks();
    mockGenerateUniquePickupCode.mockReset();
    mockGenerateUniquePickupCode.mockImplementation(() =>
      Promise.resolve("123456"),
    );

    mock.module("../src/utils/pickup-code.util.ts", () => ({
      generateUniquePickupCode: mockGenerateUniquePickupCode,
    }));

    mock.module("../src/utils/locker.util.ts", () => ({
      getSmallestAvailableLocker: lockerUtil.getSmallestAvailableLocker,
      canPackageFitLocker: lockerUtil.canPackageFitLocker,
    }));

    mockRequest = createMockRequest();
    mockReply = createMockReply();
  });

  describe("getLockersAvailability", () => {
    test("should return lockers and recommended locker for package size", async () => {
      mockFindToArray(mockedLockersCollection, allAvailableLockers);
      mockRequest.query = { packageSize: PACKAGE_SIZE.SMALL };

      await getLockersAvailability(
        mockRequest as FastifyRequest<{ Querystring: AgentDropoffLockersQuery }>,
        mockReply as FastifyReply,
      );

      expect(mockReply.send).toHaveBeenCalledTimes(1);
      const response = (mockReply.send as ReturnType<typeof mock>).mock
        .calls[0][0];
      expect(response.lockers).toHaveLength(3);
      expect(response.recommendedLocker).toMatchObject({
        lockerId: "L001",
        size: PACKAGE_SIZE.SMALL,
        status: LOCKER_STATUS.AVAILABLE,
      });
    });

    test("should return null recommended locker when none are available", async () => {
      mockFindToArray(mockedLockersCollection, [occupiedLocker]);
      mockRequest.query = { packageSize: PACKAGE_SIZE.SMALL };

      await getLockersAvailability(
        mockRequest as FastifyRequest<{ Querystring: AgentDropoffLockersQuery }>,
        mockReply as FastifyReply,
      );

      const response = (mockReply.send as ReturnType<typeof mock>).mock
        .calls[0][0];
      expect(response.recommendedLocker).toBeNull();
    });
  });

  describe("dropOffPackage", () => {
    function setupSuccessfulDropoffMocks() {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockFindToArray(mockedLockersCollection, allAvailableLockers);

      const reservedLocker = {
        ...smallLocker,
        status: LOCKER_STATUS.OCCUPIED,
        currentPackageId: new ObjectId(),
      };

      mockedLockersCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(reservedLocker),
      );
      mockedPackagesCollection.insertOne.mockImplementation(() =>
        Promise.resolve({ acknowledged: true }),
      );

      return reservedLocker;
    }

    test("should create package and return 201 on success", async () => {
      setupSuccessfulDropoffMocks();
      mockRequest.body = {
        packageSize: PACKAGE_SIZE.SMALL,
        lockerId: "L001",
      };

      await dropOffPackage(
        mockRequest as FastifyRequest<{ Body: ConfirmAgentDropoffRequest }>,
        mockReply as FastifyReply,
      );

      expect(mockGenerateUniquePickupCode).toHaveBeenCalled();
      expect(mockedPackagesCollection.insertOne).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledTimes(1);

      const response = (mockReply.send as ReturnType<typeof mock>).mock
        .calls[0][0];
      expect(response.package).toMatchObject({
        agentId: "agent-001",
        lockerId: "L001",
        packageSize: PACKAGE_SIZE.SMALL,
        pickupCode: "123456",
        status: PACKAGE_STATUS.STORED,
      });
      expect(response.locker).toMatchObject({
        lockerId: "L001",
        status: LOCKER_STATUS.OCCUPIED,
      });
    });

    test("should throw AUTHENTICATED_AGENT_NOT_FOUND when agent is missing", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = {
        packageSize: PACKAGE_SIZE.SMALL,
        lockerId: "L001",
      };

      await expectAppError(
        dropOffPackage(
          mockRequest as FastifyRequest<{ Body: ConfirmAgentDropoffRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "AUTHENTICATED_AGENT_NOT_FOUND",
          statusCode: 401,
        },
      );
    });

    test("should throw NO_SUITABLE_LOCKER when no locker is available", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockFindToArray(mockedLockersCollection, [occupiedLocker]);
      mockRequest.body = {
        packageSize: PACKAGE_SIZE.SMALL,
        lockerId: "L001",
      };

      await expectAppError(
        dropOffPackage(
          mockRequest as FastifyRequest<{ Body: ConfirmAgentDropoffRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "NO_SUITABLE_LOCKER",
          statusCode: 409,
        },
      );
    });

    test("should throw LOCKER_RECOMMENDATION_CHANGED when lockerId differs", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockFindToArray(mockedLockersCollection, allAvailableLockers);
      mockRequest.body = {
        packageSize: PACKAGE_SIZE.SMALL,
        lockerId: "L002",
      };

      await expectAppError(
        dropOffPackage(
          mockRequest as FastifyRequest<{ Body: ConfirmAgentDropoffRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "LOCKER_RECOMMENDATION_CHANGED",
          statusCode: 409,
        },
      );
    });

    test("should throw LOCKER_UNAVAILABLE when reservation fails", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockFindToArray(mockedLockersCollection, allAvailableLockers);
      mockedLockersCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = {
        packageSize: PACKAGE_SIZE.SMALL,
        lockerId: "L001",
      };

      await expectAppError(
        dropOffPackage(
          mockRequest as FastifyRequest<{ Body: ConfirmAgentDropoffRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "LOCKER_UNAVAILABLE",
          statusCode: 409,
        },
      );
    });

    test("should rollback locker reservation when package insert fails", async () => {
      const reservedLocker = setupSuccessfulDropoffMocks();
      mockedPackagesCollection.insertOne.mockImplementation(() =>
        Promise.reject(new Error("Insert failed")),
      );
      mockRequest.body = {
        packageSize: PACKAGE_SIZE.SMALL,
        lockerId: "L001",
      };

      await expect(
        dropOffPackage(
          mockRequest as FastifyRequest<{ Body: ConfirmAgentDropoffRequest }>,
          mockReply as FastifyReply,
        ),
      ).rejects.toThrow("Insert failed");

      expect(mockedLockersCollection.updateOne).toHaveBeenCalledWith(
        {
          _id: reservedLocker._id,
          currentPackageId: expect.any(ObjectId),
        },
        {
          $set: {
            status: LOCKER_STATUS.AVAILABLE,
            currentPackageId: null,
          },
        },
      );
    });

    test("should throw LOCKER_SIZE_MISMATCH when locker does not fit package", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockFindToArray(mockedLockersCollection, allAvailableLockers);

      mock.module("../src/utils/locker.util.ts", () => ({
        getSmallestAvailableLocker: mock(() => smallLocker),
        canPackageFitLocker: mock(() => false),
      }));

      mockRequest.body = {
        packageSize: PACKAGE_SIZE.MEDIUM,
        lockerId: "L001",
      };

      await expectAppError(
        dropOffPackage(
          mockRequest as FastifyRequest<{ Body: ConfirmAgentDropoffRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "LOCKER_SIZE_MISMATCH",
          statusCode: 400,
        },
      );
    });
  });

  describe("updateAgentDropoffTime", () => {
    test("should update droppedOffAt and return package", async () => {
      const updatedDroppedOffAt = "2026-02-01T12:00:00.000Z";
      const updatedPackage = {
        ...storedPackage,
        droppedOffAt: updatedDroppedOffAt,
      };

      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockedPackagesCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(updatedPackage),
      );
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(occupiedLocker),
      );
      mockRequest.body = {
        packageId: storedPackage.packageId,
        droppedOffAt: updatedDroppedOffAt,
      };

      await updateAgentDropoffTime(
        mockRequest as FastifyRequest<{ Body: UpdateAgentDropoffTimeRequest }>,
        mockReply as FastifyReply,
      );

      expect(mockReply.send).toHaveBeenCalledTimes(1);
      const response = (mockReply.send as ReturnType<typeof mock>).mock
        .calls[0][0];
      expect(response.package.droppedOffAt).toBe(updatedDroppedOffAt);
    });

    test("should throw AUTHENTICATED_AGENT_NOT_FOUND when agent is missing", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = {
        packageId: storedPackage.packageId,
        droppedOffAt: "2026-02-01T12:00:00.000Z",
      };

      await expectAppError(
        updateAgentDropoffTime(
          mockRequest as FastifyRequest<{ Body: UpdateAgentDropoffTimeRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "AUTHENTICATED_AGENT_NOT_FOUND",
          statusCode: 401,
        },
      );
    });

    test("should throw PACKAGE_NOT_FOUND when package does not exist", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockedPackagesCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = {
        packageId: "pkg_missing",
        droppedOffAt: "2026-02-01T12:00:00.000Z",
      };

      await expectAppError(
        updateAgentDropoffTime(
          mockRequest as FastifyRequest<{ Body: UpdateAgentDropoffTimeRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "PACKAGE_NOT_FOUND",
          statusCode: 404,
        },
      );
    });

    test("should throw PACKAGE_ALREADY_RETRIEVED when package was retrieved", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockedPackagesCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve({ ...storedPackage, status: PACKAGE_STATUS.RETRIEVED }),
      );
      mockRequest.body = {
        packageId: storedPackage.packageId,
        droppedOffAt: "2026-02-01T12:00:00.000Z",
      };

      await expectAppError(
        updateAgentDropoffTime(
          mockRequest as FastifyRequest<{ Body: UpdateAgentDropoffTimeRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "PACKAGE_ALREADY_RETRIEVED",
          statusCode: 409,
        },
      );
    });

    test("should throw LOCKER_NOT_FOUND when locker is missing", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockedPackagesCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(storedPackage),
      );
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = {
        packageId: storedPackage.packageId,
        droppedOffAt: "2026-02-01T12:00:00.000Z",
      };

      await expectAppError(
        updateAgentDropoffTime(
          mockRequest as FastifyRequest<{ Body: UpdateAgentDropoffTimeRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "LOCKER_NOT_FOUND",
          statusCode: 404,
        },
      );
    });
  });
});
