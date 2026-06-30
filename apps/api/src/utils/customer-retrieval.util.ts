import type { Db } from "mongodb";
import { AppError } from "@/errors/app-error";
import { getAgentsCollection, getPackagesCollection } from "@/models";
import type {
  AgentDocument,
  LockerDocument,
  PackageDocument,
} from "@/types/documents";
import type { PackageEntity } from "@/types/entities";
import { LOCKER_STATUS } from "@/types/enum";

export function normalizeRetrievalInput(lockerId: string, pickupCode: string) {
  return {
    lockerId: lockerId.trim().toUpperCase(),
    pickupCode: pickupCode.trim(),
  };
}

export function toInvalidLockerOrPickupCodeError() {
  return new AppError({
    code: "INVALID_LOCKER_OR_PICKUP_CODE",
    message: "Locker ID or pickup code is invalid.",
    statusCode: 404,
  });
}

export function toPackageAlreadyRetrievedError() {
  return new AppError({
    code: "PACKAGE_ALREADY_RETRIEVED",
    message: "This package has already been retrieved.",
    statusCode: 409,
  });
}

export function toLockerStateMismatchError() {
  return new AppError({
    code: "LOCKER_STATE_MISMATCH",
    message: "Locker state no longer matches the package being retrieved.",
    statusCode: 409,
  });
}

export function buildPackageRollbackUpdate(packageRecord: PackageDocument) {
  const rollbackSet: Partial<PackageEntity> = {
    status: packageRecord.status,
    retrievedAt: packageRecord.retrievedAt ?? null,
  };
  const rollbackUnset: Record<string, ""> = {};

  if (packageRecord.storageChargeAmount !== undefined) {
    rollbackSet.storageChargeAmount = packageRecord.storageChargeAmount;
  } else {
    rollbackUnset.storageChargeAmount = "";
  }

  if (packageRecord.chargeableDays !== undefined) {
    rollbackSet.chargeableDays = packageRecord.chargeableDays;
  } else {
    rollbackUnset.chargeableDays = "";
  }

  if (Object.keys(rollbackUnset).length === 0) {
    return { $set: rollbackSet };
  }

  return {
    $set: rollbackSet,
    $unset: rollbackUnset,
  };
}

export function assertLockerStateMatchesPackage(
  locker: LockerDocument,
  packageRecord: PackageDocument,
) {
  if (
    locker.status !== LOCKER_STATUS.OCCUPIED ||
    !locker.currentPackageId ||
    !locker.currentPackageId.equals(packageRecord._id)
  ) {
    throw toLockerStateMismatchError();
  }
}

export async function findLatestPackageForLockerAndPickupCode(
  db: Db,
  locker: LockerDocument,
  pickupCode: string,
): Promise<PackageDocument | null> {
  return getPackagesCollection(db).findOne(
    { lockerId: locker._id, pickupCode },
    { sort: { droppedOffAt: -1 } },
  );
}

export async function resolveAgentForPackage(
  db: Db,
  packageRecord: PackageDocument,
): Promise<AgentDocument> {
  const agent = await getAgentsCollection(db).findOne({ _id: packageRecord.agentId });

  if (!agent) {
    throw new AppError({
      code: "PACKAGE_REFERENCE_ERROR",
      message: "Package reference resolution failed.",
      statusCode: 500,
    });
  }

  return agent;
}
