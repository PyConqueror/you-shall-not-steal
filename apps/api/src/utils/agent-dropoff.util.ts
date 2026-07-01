import type {
  PublicLockerResponse,
  StoredPackageRecordResponse,
} from "@/schemas/agent-dropoff";
import type {
  AgentDocument,
  LockerDocument,
  PackageDocument,
} from "@/types/documents";

export function toPublicLocker(locker: LockerDocument): PublicLockerResponse {
  return {
    id: locker.id,
    lockerId: locker.lockerId,
    size: locker.size,
    status: locker.status,
    currentPackageId: locker.currentPackageId?.toHexString() ?? null,
  };
}

export function toStoredPackageRecord(
  packageRecord: PackageDocument,
  agent: AgentDocument,
  locker: LockerDocument,
): StoredPackageRecordResponse {
  return {
    packageId: packageRecord.packageId,
    agentId: agent.agentId,
    lockerId: locker.lockerId,
    packageSize: packageRecord.packageSize,
    pickupCode: packageRecord.pickupCode,
    customerEmail: packageRecord.customerEmail ?? null,
    status: packageRecord.status,
    droppedOffAt: packageRecord.droppedOffAt,
    retrievedAt: packageRecord.retrievedAt ?? null,
    storageChargeAmount: packageRecord.storageChargeAmount,
    chargeableDays: packageRecord.chargeableDays,
  };
}
