export type PackageSize = "small" | "medium" | "large";

export type LockerStatus = "available" | "occupied" | "maintenance";

export type PackageStatus = "stored" | "retrieved";

export type Agent = {
  agentId: string;
  name: string;
  status: "active" | "inactive";
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
  status: PackageStatus;
  droppedOffAt: string;
  retrievedAt?: string | null;
};
