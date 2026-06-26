import { Locker } from "../types";

export const mockLockers: Locker[] = [
  {
    id: "locker_001",
    lockerId: "S-01",
    size: "small",
    status: "available",
    currentPackageId: null,
  },
  {
    id: "locker_002",
    lockerId: "S-02",
    size: "small",
    status: "occupied",
    currentPackageId: "pkg_existing_001",
  },
  {
    id: "locker_003",
    lockerId: "S-03",
    size: "small",
    status: "available",
    currentPackageId: null,
  },
  {
    id: "locker_004",
    lockerId: "M-01",
    size: "medium",
    status: "available",
    currentPackageId: null,
  },
  {
    id: "locker_005",
    lockerId: "M-02",
    size: "medium",
    status: "occupied",
    currentPackageId: "pkg_existing_002",
  },
  {
    id: "locker_006",
    lockerId: "M-03",
    size: "medium",
    status: "available",
    currentPackageId: null,
  },
  {
    id: "locker_007",
    lockerId: "L-01",
    size: "large",
    status: "available",
    currentPackageId: null,
  },
  {
    id: "locker_008",
    lockerId: "L-02",
    size: "large",
    status: "maintenance",
    currentPackageId: null,
  },
];
