import { randomUUID } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ObjectId } from "mongodb";
import { AppError } from "@/errors/app-error";
import {
  getAgentsCollection,
  getLockersCollection,
  getPackagesCollection,
} from "@/models";
import type {
  AgentDropoffLockersQuery,
  AgentDropoffLockersResponse,
  ConfirmAgentDropoffRequest,
  ConfirmAgentDropoffResponse,
  UpdateAgentDropoffTimeRequest,
  UpdateAgentDropoffTimeResponse,
} from "@/schemas/agent-dropoff";
import type { PackageDocument } from "@/types/documents";
import { LOCKER_STATUS, PACKAGE_STATUS } from "@/types/enum";
import {
  toPublicLocker,
  toStoredPackageRecord,
} from "@/utils/agent-dropoff.util";
import { canPackageFitLocker, getSmallestAvailableLocker } from "@/utils/locker.util";
import { generateUniquePickupCode } from "@/utils/pickup-code.util";

export async function getLockersAvailability(
  request: FastifyRequest<{ Querystring: AgentDropoffLockersQuery }>,
  reply: FastifyReply,
) {
  const lockers = await getLockersCollection(request.server.mongo.db)
    .find({}, { sort: { lockerId: 1 } })
    .toArray();

  const recommendedLocker = getSmallestAvailableLocker(
    lockers,
    request.query.packageSize,
  );

  const response: AgentDropoffLockersResponse = {
    lockers: lockers.map(toPublicLocker),
    recommendedLocker: recommendedLocker ? toPublicLocker(recommendedLocker) : null,
  };

  return reply.send(response);
}

export async function dropOffPackage(
  request: FastifyRequest<{ Body: ConfirmAgentDropoffRequest }>,
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

  const lockers = await lockersCollection.find({}, { sort: { lockerId: 1 } }).toArray();
  const recommendedLocker = getSmallestAvailableLocker(
    lockers,
    request.body.packageSize,
  );

  if (!recommendedLocker) {
    throw new AppError({
      code: "NO_SUITABLE_LOCKER",
      message: "No suitable locker is available right now.",
      statusCode: 409,
    });
  }

  if (recommendedLocker.lockerId !== request.body.lockerId) {
    throw new AppError({
      code: "LOCKER_RECOMMENDATION_CHANGED",
      message: "Locker recommendation changed. Please review the latest recommendation.",
      statusCode: 409,
    });
  }

  if (!canPackageFitLocker(request.body.packageSize, recommendedLocker.size)) {
    throw new AppError({
      code: "LOCKER_SIZE_MISMATCH",
      message: "Locker does not fit the selected package size.",
      statusCode: 400,
    });
  }

  const packageObjectId = new ObjectId();
  const droppedOffAt = new Date().toISOString();
  const packageId = `pkg_${randomUUID()}`;
  const pickupCode = await generateUniquePickupCode(db);

  const reservedLocker = await lockersCollection.findOneAndUpdate(
    {
      _id: recommendedLocker._id,
      status: LOCKER_STATUS.AVAILABLE,
    },
    {
      $set: {
        status: LOCKER_STATUS.OCCUPIED,
        currentPackageId: packageObjectId,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!reservedLocker) {
    throw new AppError({
      code: "LOCKER_UNAVAILABLE",
      message: "Locker is no longer available.",
      statusCode: 409,
    });
  }

  const packageRecord: PackageDocument = {
    _id: packageObjectId,
    packageId,
    agentId: agent._id,
    lockerId: reservedLocker._id,
    packageSize: request.body.packageSize,
    pickupCode,
    status: PACKAGE_STATUS.STORED,
    droppedOffAt,
    retrievedAt: null,
  };

  try {
    await packagesCollection.insertOne(packageRecord);
  } catch (error) {
    await lockersCollection.updateOne(
      {
        _id: reservedLocker._id,
        currentPackageId: packageObjectId,
      },
      {
        $set: {
          status: LOCKER_STATUS.AVAILABLE,
          currentPackageId: null,
        },
      },
    );

    throw error;
  }

  const response: ConfirmAgentDropoffResponse = {
    package: toStoredPackageRecord(packageRecord, agent, reservedLocker),
    locker: toPublicLocker(reservedLocker),
  };

  return reply.status(201).send(response);
}

export async function updateAgentDropoffTime(
  request: FastifyRequest<{ Body: UpdateAgentDropoffTimeRequest }>,
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

  const updatedPackage = await packagesCollection.findOneAndUpdate(
    {
      packageId: request.body.packageId,
      agentId: agent._id,
      status: PACKAGE_STATUS.STORED,
    },
    {
      $set: {
        droppedOffAt: request.body.droppedOffAt,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedPackage) {
    const existingPackage = await packagesCollection.findOne({
      packageId: request.body.packageId,
      agentId: agent._id,
    });

    if (existingPackage?.status === PACKAGE_STATUS.RETRIEVED) {
      throw new AppError({
        code: "PACKAGE_ALREADY_RETRIEVED",
        message: "Package was already retrieved.",
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

  const response: UpdateAgentDropoffTimeResponse = {
    package: toStoredPackageRecord(updatedPackage, agent, locker),
  };

  return reply.send(response);
}
