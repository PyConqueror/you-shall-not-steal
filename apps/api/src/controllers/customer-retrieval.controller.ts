import type { FastifyReply, FastifyRequest } from "fastify";
import { getLockersCollection, getPackagesCollection } from "@/models";
import type {
  ConfirmCustomerRetrievalRequest,
  ConfirmCustomerRetrievalResponse,
  CustomerRetrievalLookupRequest,
  CustomerRetrievalLookupResponse,
} from "@/schemas/customer-retrieval";
import { LOCKER_STATUS, PACKAGE_STATUS } from "@/types/enum";
import { toPublicLocker, toStoredPackageRecord } from "@/utils/agent-dropoff.util";
import {
  assertLockerStateMatchesPackage,
  buildPackageRollbackUpdate,
  findLatestPackageForLockerAndPickupCode,
  normalizeRetrievalInput,
  resolveAgentForPackage,
  toInvalidLockerOrPickupCodeError,
  toLockerStateMismatchError,
  toPackageAlreadyRetrievedError,
} from "@/utils/customer-retrieval.util";
import { createStorageChargePreview } from "@/utils/storage-charge.util";

export async function lookupCustomerRetrieval(
  request: FastifyRequest<{ Body: CustomerRetrievalLookupRequest }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const input = normalizeRetrievalInput(
    request.body.lockerId,
    request.body.pickupCode,
  );

  const locker = await getLockersCollection(db).findOne({ lockerId: input.lockerId });

  if (!locker) {
    throw toInvalidLockerOrPickupCodeError();
  }

  const packageRecord = await getPackagesCollection(db).findOne({
    lockerId: locker._id,
    pickupCode: input.pickupCode,
    status: PACKAGE_STATUS.STORED,
  });

  if (!packageRecord) {
    throw toInvalidLockerOrPickupCodeError();
  }

  assertLockerStateMatchesPackage(locker, packageRecord);

  const agent = await resolveAgentForPackage(db, packageRecord);

  const response: CustomerRetrievalLookupResponse = {
    package: toStoredPackageRecord(packageRecord, agent, locker),
    locker: toPublicLocker(locker),
    chargePreview: createStorageChargePreview(packageRecord.droppedOffAt),
  };

  return reply.send(response);
}

export async function confirmCustomerRetrieval(
  request: FastifyRequest<{ Body: ConfirmCustomerRetrievalRequest }>,
  reply: FastifyReply,
) {
  const db = request.server.mongo.db;
  const lockersCollection = getLockersCollection(db);
  const packagesCollection = getPackagesCollection(db);
  const input = normalizeRetrievalInput(
    request.body.lockerId,
    request.body.pickupCode,
  );

  const locker = await lockersCollection.findOne({ lockerId: input.lockerId });

  if (!locker) {
    throw toInvalidLockerOrPickupCodeError();
  }

  const packageRecord = await packagesCollection.findOne({
    lockerId: locker._id,
    pickupCode: input.pickupCode,
    status: PACKAGE_STATUS.STORED,
  });

  if (!packageRecord) {
    const latestPackage = await findLatestPackageForLockerAndPickupCode(
      db,
      locker,
      input.pickupCode,
    );

    if (latestPackage?.status === PACKAGE_STATUS.RETRIEVED) {
      throw toPackageAlreadyRetrievedError();
    }

    throw toInvalidLockerOrPickupCodeError();
  }

  assertLockerStateMatchesPackage(locker, packageRecord);

  const agent = await resolveAgentForPackage(db, packageRecord);

  const chargePreview = createStorageChargePreview(packageRecord.droppedOffAt);
  const updatedPackage = await packagesCollection.findOneAndUpdate(
    {
      _id: packageRecord._id,
      lockerId: locker._id,
      pickupCode: input.pickupCode,
      status: PACKAGE_STATUS.STORED,
    },
    {
      $set: {
        status: PACKAGE_STATUS.RETRIEVED,
        retrievedAt: chargePreview.retrievedAt,
        chargeableDays: chargePreview.chargeableDays,
        storageChargeAmount: chargePreview.totalAmount,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedPackage) {
    const latestPackage = await findLatestPackageForLockerAndPickupCode(
      db,
      locker,
      input.pickupCode,
    );

    if (latestPackage?.status === PACKAGE_STATUS.RETRIEVED) {
      throw toPackageAlreadyRetrievedError();
    }

    throw toInvalidLockerOrPickupCodeError();
  }

  const releasedLocker = await lockersCollection.findOneAndUpdate(
    {
      _id: locker._id,
      status: LOCKER_STATUS.OCCUPIED,
      currentPackageId: updatedPackage._id,
    },
    {
      $set: {
        status: LOCKER_STATUS.AVAILABLE,
        currentPackageId: null,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!releasedLocker) {
    await packagesCollection.updateOne(
      {
        _id: updatedPackage._id,
        status: PACKAGE_STATUS.RETRIEVED,
        retrievedAt: chargePreview.retrievedAt,
      },
      buildPackageRollbackUpdate(packageRecord),
    );

    throw toLockerStateMismatchError();
  }

  const response: ConfirmCustomerRetrievalResponse = {
    package: toStoredPackageRecord(updatedPackage, agent, releasedLocker),
    locker: toPublicLocker(releasedLocker),
  };

  return reply.send(response);
}
