import { Locker, PackageSize } from "../types";

export function canPackageFitLocker(packageSize: PackageSize, lockerSize: PackageSize): boolean {
  if (packageSize === "small") {
    return true; // Small fits in small, medium, large
  }
  if (packageSize === "medium") {
    return lockerSize === "medium" || lockerSize === "large";
  }
  if (packageSize === "large") {
    return lockerSize === "large";
  }
  return false;
}

export function getLockerAvailabilityReason(locker: Locker, packageSize: PackageSize | null): string | null {
  if (locker.status === "occupied") {
    return "Occupied";
  }
  if (locker.status === "maintenance") {
    return "Maintenance";
  }
  if (packageSize && !canPackageFitLocker(packageSize, locker.size)) {
    return "Too Small";
  }
  return null; // Available
}
