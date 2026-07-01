import type {
  AgentStatus,
  LockerStatus,
  PackageSize,
  PackageStatus,
} from "./enum";

export type { AgentStatus, LockerStatus, PackageSize, PackageStatus } from "./enum";

export type Agent = {
  agentId: string;
  name: string;
  status: AgentStatus;
};

export type Locker = {
  id: string;
  lockerId: string;
  size: PackageSize;
  status: LockerStatus;
  currentPackageId?: string | null;
};

export type PackageRecord = {
  packageId: string;
  agentId: string;
  lockerId: string;
  packageSize: PackageSize;
  pickupCode: string;
  customerEmail?: string | null;
  status: PackageStatus;
  droppedOffAt: string;
  retrievedAt?: string | null;
  storageChargeAmount?: number;
  chargeableDays?: number;
};
