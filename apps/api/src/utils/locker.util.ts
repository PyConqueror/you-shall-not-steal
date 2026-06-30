import type { LockerEntity } from "@/types/entities";
import type { PackageSize } from "@/types/enum";
import { LOCKER_STATUS } from "@/types/enum";

const sizeRank: Record<PackageSize, number> = {
  small: 1,
  medium: 2,
  large: 3,
};

type LockerAssignmentCandidate = Pick<LockerEntity, "lockerId" | "size" | "status">;

export function canPackageFitLocker(
  packageSize: PackageSize,
  lockerSize: PackageSize,
): boolean {
  return sizeRank[lockerSize] >= sizeRank[packageSize];
}

export function getSmallestAvailableLocker<
  TLocker extends LockerAssignmentCandidate,
>(lockers: TLocker[], packageSize: PackageSize): TLocker | null {
  const compatibleAvailableLockers = lockers.filter((locker) => {
    return (
      locker.status === LOCKER_STATUS.AVAILABLE &&
      canPackageFitLocker(packageSize, locker.size)
    );
  });

  compatibleAvailableLockers.sort((leftLocker, rightLocker) => {
    if (sizeRank[leftLocker.size] !== sizeRank[rightLocker.size]) {
      return sizeRank[leftLocker.size] - sizeRank[rightLocker.size];
    }

    return leftLocker.lockerId.localeCompare(rightLocker.lockerId);
  });

  return compatibleAvailableLockers[0] ?? null;
}
