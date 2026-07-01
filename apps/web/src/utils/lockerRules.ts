import type { Locker, PackageSize } from "@/types";

export function canPackageFitLocker(
  packageSize: PackageSize,
  lockerSize: PackageSize
): boolean {
  const sizeRank: Record<PackageSize, number> = {
    small: 1,
    medium: 2,
    large: 3,
  };

  return sizeRank[lockerSize] >= sizeRank[packageSize];
}

export function getSmallestAvailableLocker(
  lockers: Locker[],
  packageSize: PackageSize
): Locker | null {
  const sizeRank: Record<PackageSize, number> = {
    small: 1,
    medium: 2,
    large: 3,
  };

  const compatibleAvailableLockers = lockers.filter((locker) => {
    return (
      locker.status === "available" &&
      canPackageFitLocker(packageSize, locker.size)
    );
  });

  compatibleAvailableLockers.sort((a, b) => {
    if (sizeRank[a.size] !== sizeRank[b.size]) {
      return sizeRank[a.size] - sizeRank[b.size];
    }

    return a.lockerId.localeCompare(b.lockerId);
  });

  return compatibleAvailableLockers[0] ?? null;
}

export function getLockerDisplayReason(
  locker: Locker,
  packageSize: PackageSize | null,
  assignedLockerId?: string | null
): string {
  if (assignedLockerId && locker.id === assignedLockerId) {
    return "Auto assigned";
  }

  if (locker.status === "occupied") {
    return "Occupied";
  }

  if (locker.status === "maintenance") {
    return "Under maintenance";
  }

  if (packageSize && !canPackageFitLocker(packageSize, locker.size)) {
    return "Too small";
  }

  return "Available";
}
