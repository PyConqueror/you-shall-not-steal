import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/errors/app-error";
import {
  getAgentsCollection,
  getLockersCollection,
  getPackagesCollection,
} from "@/models";
import type {
  SendEmailRequest,
  SendEmailResponse,
} from "@/schemas/email";
import { PACKAGE_STATUS } from "@/types/enum";
import { toStoredPackageRecord } from "@/utils/agent-dropoff.util";
import { sendPickupDetailsEmail } from "@/utils/email.util";

export async function sendEmail(
  request: FastifyRequest<{ Body: SendEmailRequest }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const agentsCollection = getAgentsCollection(db);
  const lockersCollection = getLockersCollection(db);
  const packagesCollection = getPackagesCollection(db);

  const agent = await agentsCollection.findOne({
    agentId: request.user.sub,
  });

  if (!agent) {
    throw new AppError({
      code: "AUTHENTICATED_AGENT_NOT_FOUND",
      message: "Authenticated agent could not be resolved.",
      statusCode: 401,
    });
  }

  const customerEmail = request.body.customerEmail.trim();
  const existingPackage = await packagesCollection.findOne({
    packageId: request.body.packageId,
    agentId: agent._id,
  });

  if (!existingPackage) {
    throw new AppError({
      code: "PACKAGE_NOT_FOUND",
      message: "Package could not be found for this agent.",
      statusCode: 404,
    });
  }

  if (existingPackage.status === PACKAGE_STATUS.RETRIEVED) {
    throw new AppError({
      code: "PACKAGE_ALREADY_RETRIEVED",
      message: "Package was already retrieved.",
      statusCode: 409,
    });
  }

  if (existingPackage.customerEmail) {
    throw new AppError({
      code: "CUSTOMER_EMAIL_ALREADY_SENT",
      message: "Pickup details were already emailed for this package.",
      statusCode: 409,
    });
  }

  const resendApiKey = request.server.config.RESEND_API_KEY;
  const resendFromEmail = request.server.config.RESEND_FROM_EMAIL;

  if (!resendApiKey || !resendFromEmail) {
    throw new AppError({
      code: "CUSTOMER_EMAIL_NOT_CONFIGURED",
      message: "Customer email sending is not configured on this server.",
      statusCode: 503,
    });
  }

  const updatedPackage = await packagesCollection.findOneAndUpdate(
    {
      packageId: request.body.packageId,
      agentId: agent._id,
      status: PACKAGE_STATUS.STORED,
      customerEmail: null,
    },
    {
      $set: {
        customerEmail,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedPackage) {
    const currentPackage = await packagesCollection.findOne({
      packageId: request.body.packageId,
      agentId: agent._id,
    });

    if (currentPackage?.status === PACKAGE_STATUS.RETRIEVED) {
      throw new AppError({
        code: "PACKAGE_ALREADY_RETRIEVED",
        message: "Package was already retrieved.",
        statusCode: 409,
      });
    }

    if (currentPackage?.customerEmail) {
      throw new AppError({
        code: "CUSTOMER_EMAIL_ALREADY_SENT",
        message: "Pickup details were already emailed for this package.",
        statusCode: 409,
      });
    }

    throw new AppError({
      code: "PACKAGE_NOT_FOUND",
      message: "Package could not be found for this agent.",
      statusCode: 404,
    });
  }

  const locker = await lockersCollection.findOne({
    _id: updatedPackage.lockerId,
  });

  if (!locker) {
    throw new AppError({
      code: "LOCKER_NOT_FOUND",
      message: "Locker for this package could not be found.",
      statusCode: 404,
    });
  }

  try {
    await sendPickupDetailsEmail({
      resendApiKey,
      from: resendFromEmail,
      customerEmail,
      agentId: agent.agentId,
      packageRecord: updatedPackage,
      lockerId: locker.lockerId,
    });
  } catch (error) {
    await packagesCollection.updateOne(
      {
        _id: updatedPackage._id,
        agentId: agent._id,
        status: PACKAGE_STATUS.STORED,
        customerEmail,
      },
      {
        $set: {
          customerEmail: null,
        },
      },
    );

    throw error;
  }

  const response: SendEmailResponse = {
    package: toStoredPackageRecord(updatedPackage, agent, locker),
  };

  return reply.send(response);
}
