const mockSendPickupDetailsEmail = mock(() => Promise.resolve());

import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { FastifyReply, FastifyRequest } from "fastify";

import { sendEmail } from "../src/controllers/email.controller";
import { AppError } from "../src/errors/app-error";
import type { SendEmailRequest } from "../src/schemas/email";
import {
  activeAgent,
  occupiedLocker,
  storedPackage,
  storedPackageWithEmail,
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
import { PACKAGE_STATUS } from "../src/types/enum";

describe("email controller", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    setupModelMocks();
    mockSendPickupDetailsEmail.mockReset();
    mockSendPickupDetailsEmail.mockImplementation(() => Promise.resolve());

    mock.module("../src/utils/email.util.ts", () => ({
      sendPickupDetailsEmail: mockSendPickupDetailsEmail,
    }));

    mockRequest = createMockRequest();
    mockReply = createMockReply();
  });

  function setupSuccessfulEmailMocks() {
    mockedAgentsCollection.findOne.mockImplementation(() =>
      Promise.resolve(activeAgent),
    );
    mockedPackagesCollection.findOne.mockImplementation(() =>
      Promise.resolve(storedPackage),
    );
    mockedPackagesCollection.findOneAndUpdate.mockImplementation(() =>
      Promise.resolve({ ...storedPackage, customerEmail: "customer@example.com" }),
    );
    mockedLockersCollection.findOne.mockImplementation(() =>
      Promise.resolve(occupiedLocker),
    );
  }

  describe("sendEmail", () => {
    test("should send email and return updated package on success", async () => {
      setupSuccessfulEmailMocks();
      mockRequest.body = {
        packageId: storedPackage.packageId,
        customerEmail: "customer@example.com",
      };

      await sendEmail(
        mockRequest as FastifyRequest<{ Body: SendEmailRequest }>,
        mockReply as FastifyReply,
      );

      expect(mockSendPickupDetailsEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          customerEmail: "customer@example.com",
          agentId: "agent-001",
          lockerId: "L004",
        }),
      );
      expect(mockReply.send).toHaveBeenCalledTimes(1);
      const response = (mockReply.send as ReturnType<typeof mock>).mock
        .calls[0][0];
      expect(response.package.customerEmail).toBe("customer@example.com");
    });

    test("should throw AUTHENTICATED_AGENT_NOT_FOUND when agent is missing", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = {
        packageId: storedPackage.packageId,
        customerEmail: "customer@example.com",
      };

      await expectAppError(
        sendEmail(
          mockRequest as FastifyRequest<{ Body: SendEmailRequest }>,
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
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = {
        packageId: "pkg_missing",
        customerEmail: "customer@example.com",
      };

      await expectAppError(
        sendEmail(
          mockRequest as FastifyRequest<{ Body: SendEmailRequest }>,
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
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve({ ...storedPackage, status: PACKAGE_STATUS.RETRIEVED }),
      );
      mockRequest.body = {
        packageId: storedPackage.packageId,
        customerEmail: "customer@example.com",
      };

      await expectAppError(
        sendEmail(
          mockRequest as FastifyRequest<{ Body: SendEmailRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "PACKAGE_ALREADY_RETRIEVED",
          statusCode: 409,
        },
      );
    });

    test("should throw CUSTOMER_EMAIL_ALREADY_SENT when email was already sent", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve(storedPackageWithEmail),
      );
      mockRequest.body = {
        packageId: storedPackage.packageId,
        customerEmail: "customer@example.com",
      };

      await expectAppError(
        sendEmail(
          mockRequest as FastifyRequest<{ Body: SendEmailRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "CUSTOMER_EMAIL_ALREADY_SENT",
          statusCode: 409,
        },
      );
    });

    test("should throw CUSTOMER_EMAIL_NOT_CONFIGURED when resend is not configured", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve(storedPackage),
      );
      mockRequest = createMockRequest({
        config: { RESEND_API_KEY: undefined, RESEND_FROM_EMAIL: undefined },
      });
      mockRequest.body = {
        packageId: storedPackage.packageId,
        customerEmail: "customer@example.com",
      };

      await expectAppError(
        sendEmail(
          mockRequest as FastifyRequest<{ Body: SendEmailRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "CUSTOMER_EMAIL_NOT_CONFIGURED",
          statusCode: 503,
        },
      );
    });

    test("should throw LOCKER_NOT_FOUND when locker is missing after update", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockedPackagesCollection.findOne.mockImplementation(() =>
        Promise.resolve(storedPackage),
      );
      mockedPackagesCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve({ ...storedPackage, customerEmail: "customer@example.com" }),
      );
      mockedLockersCollection.findOne.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = {
        packageId: storedPackage.packageId,
        customerEmail: "customer@example.com",
      };

      await expectAppError(
        sendEmail(
          mockRequest as FastifyRequest<{ Body: SendEmailRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "LOCKER_NOT_FOUND",
          statusCode: 404,
        },
      );
    });

    test("should rollback customerEmail and throw when email send fails", async () => {
      setupSuccessfulEmailMocks();
      mockSendPickupDetailsEmail.mockImplementation(() =>
        Promise.reject(
          new AppError({
            code: "CUSTOMER_EMAIL_SEND_FAILED",
            message: "We couldn't send the email right now. Please try again.",
            statusCode: 502,
          }),
        ),
      );
      mockRequest.body = {
        packageId: storedPackage.packageId,
        customerEmail: "customer@example.com",
      };

      await expectAppError(
        sendEmail(
          mockRequest as FastifyRequest<{ Body: SendEmailRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "CUSTOMER_EMAIL_SEND_FAILED",
          statusCode: 502,
        },
      );

      expect(mockedPackagesCollection.updateOne).toHaveBeenCalledWith(
        {
          _id: storedPackage._id,
          agentId: activeAgent._id,
          status: PACKAGE_STATUS.STORED,
          customerEmail: "customer@example.com",
        },
        {
          $set: {
            customerEmail: null,
          },
        },
      );
    });

    test("should throw PACKAGE_NOT_FOUND on update race when package disappears", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockedPackagesCollection.findOne
        .mockImplementationOnce(() => Promise.resolve(storedPackage))
        .mockImplementationOnce(() => Promise.resolve(null));
      mockedPackagesCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = {
        packageId: storedPackage.packageId,
        customerEmail: "customer@example.com",
      };

      await expectAppError(
        sendEmail(
          mockRequest as FastifyRequest<{ Body: SendEmailRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "PACKAGE_NOT_FOUND",
          statusCode: 404,
        },
      );
    });

    test("should throw CUSTOMER_EMAIL_ALREADY_SENT on update race when email exists", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockedPackagesCollection.findOne
        .mockImplementationOnce(() => Promise.resolve(storedPackage))
        .mockImplementationOnce(() => Promise.resolve(storedPackageWithEmail));
      mockedPackagesCollection.findOneAndUpdate.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = {
        packageId: storedPackage.packageId,
        customerEmail: "customer@example.com",
      };

      await expectAppError(
        sendEmail(
          mockRequest as FastifyRequest<{ Body: SendEmailRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "CUSTOMER_EMAIL_ALREADY_SENT",
          statusCode: 409,
        },
      );
    });
  });
});
