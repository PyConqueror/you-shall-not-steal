import type { Locker, PackageRecord } from "@/types/domain";

export type PackageResult = {
  package: PackageRecord;
};

export type PackageLockerResult = PackageResult & {
  locker: Locker;
};
