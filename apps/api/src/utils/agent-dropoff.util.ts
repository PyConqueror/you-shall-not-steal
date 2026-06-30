import type { WithId } from "mongodb";
import type {
  PublicLockerResponse,
  StoredPackageRecordResponse,
} from "@/schemas/agent-dropoff";
import type { AgentEntity, LockerEntity, PackageEntity } from "@/types/entities";

type AgentDocument = WithId<AgentEntity>;
type LockerDocument = WithId<LockerEntity>;
type PackageDocument = WithId<PackageEntity>;

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
    status: packageRecord.status,
    droppedOffAt: packageRecord.droppedOffAt,
    retrievedAt: packageRecord.retrievedAt ?? null,
    storageChargeAmount: packageRecord.storageChargeAmount,
    chargeableDays: packageRecord.chargeableDays,
  };
}
