const DAY_IN_MS = 24 * 60 * 60 * 1000;

type MockPackageRecord = {
  packageId: string;
  agentId: string;
  lockerId: string;
  packageSize: "small" | "medium" | "large";
  pickupCode: string;
  status: "stored" | "retrieved";
  droppedOffAt: string;
  retrievedAt?: string | null;
  storageChargeAmount?: number;
  chargeableDays?: number;
};

export function createMockPackages(referenceDate = Date.now()): MockPackageRecord[] {
  return [
    {
      packageId: "pkg_existing_001",
      agentId: "AGT-1001",
      lockerId: "S-02",
      packageSize: "small",
      pickupCode: "111111",
      status: "stored",
      droppedOffAt: new Date(referenceDate - 6 * DAY_IN_MS).toISOString(),
      retrievedAt: null,
    },
    {
      packageId: "pkg_existing_002",
      agentId: "AGT-1002",
      lockerId: "M-02",
      packageSize: "medium",
      pickupCode: "222222",
      status: "stored",
      droppedOffAt: new Date(referenceDate - 11 * DAY_IN_MS).toISOString(),
      retrievedAt: null,
    },
  ];
}
