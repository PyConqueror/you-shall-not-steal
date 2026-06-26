import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Agent, Locker, PackageRecord, PackageSize } from "../types";
import { mockLockers } from "../mocks/lockers";
import { generatePickupCode } from "../utils/pickupCode";
import { calculateStorageCharge } from "../utils/storageCharges";
import { getAgentSession } from "../features/agent-auth/session";
import { FlowStateContext, type FlowStateContextValue } from "./flowState";

const initialMockPackages: PackageRecord[] = [
  {
    packageId: "pkg_existing_001",
    agentId: "AGT-1001",
    lockerId: "S-02",
    packageSize: "small",
    pickupCode: "111111",
    status: "stored",
    droppedOffAt: new Date(
      Date.now() - 6 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    retrievedAt: null,
  },
  {
    packageId: "pkg_existing_002",
    agentId: "AGT-1002",
    lockerId: "M-02",
    packageSize: "medium",
    pickupCode: "222222",
    status: "stored",
    droppedOffAt: new Date(
      Date.now() - 11 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    retrievedAt: null,
  },
];

type FlowStateProviderProps = {
  children: ReactNode;
};

export function FlowStateProvider({ children }: FlowStateProviderProps) {
  const [lockers, setLockers] = useState<Locker[]>(mockLockers);
  const [packages, setPackages] = useState<PackageRecord[]>(initialMockPackages);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(
    getAgentSession()?.agent ?? null,
  );
  const [selectedPackageSize, setSelectedPackageSize] =
    useState<PackageSize | null>(null);
  const [latestDropOffPackage, setLatestDropOffPackage] =
    useState<PackageRecord | null>(null);
  const [retrievalPackage, setRetrievalPackage] = useState<PackageRecord | null>(
    null,
  );

  const beginAgentFlow = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    setSelectedPackageSize(null);
    setLatestDropOffPackage(null);
  }, []);

  const confirmLockerDropOff = useCallback((assignedLocker: Locker) => {
    if (!selectedAgent || !selectedPackageSize) {
      return null;
    }

    const newPackage: PackageRecord = {
      packageId: `pkg_${Date.now()}`,
      agentId: selectedAgent.agentId,
      lockerId: assignedLocker.lockerId,
      packageSize: selectedPackageSize,
      pickupCode: generatePickupCode(),
      status: "stored",
      droppedOffAt: new Date().toISOString(),
    };

    setPackages((currentPackages) => [...currentPackages, newPackage]);
    setLockers((currentLockers) =>
      currentLockers.map((locker) =>
        locker.id === assignedLocker.id
          ? {
              ...locker,
              status: "occupied",
              currentPackageId: newPackage.packageId,
            }
          : locker,
      ),
    );
    setLatestDropOffPackage(newPackage);

    return newPackage;
  }, [selectedAgent, selectedPackageSize]);

  const updateLatestDropOffTime = useCallback((newTime: string) => {
    setLatestDropOffPackage((currentPackage) => {
      if (!currentPackage) {
        return currentPackage;
      }

      const updatedPackage = { ...currentPackage, droppedOffAt: newTime };
      setPackages((currentPackages) =>
        currentPackages.map((pkg) =>
          pkg.packageId === updatedPackage.packageId ? updatedPackage : pkg,
        ),
      );

      return updatedPackage;
    });
  }, []);

  const resetAgentFlow = useCallback(() => {
    setSelectedAgent(null);
    setSelectedPackageSize(null);
    setLatestDropOffPackage(null);
  }, []);

  const selectRetrievalPackage = useCallback((pkg: PackageRecord) => {
    setRetrievalPackage(pkg);
  }, []);

  const confirmRetrieval = useCallback((retrievedAt: string) => {
    if (!retrievalPackage) {
      return null;
    }

    const charges = calculateStorageCharge(
      retrievalPackage.droppedOffAt,
      retrievedAt,
    );
    const updatedPackage: PackageRecord = {
      ...retrievalPackage,
      status: "retrieved",
      retrievedAt,
      chargeableDays: charges.chargeableDays,
      storageChargeAmount: charges.totalAmount,
    };

    setPackages((currentPackages) =>
      currentPackages.map((pkg) =>
        pkg.packageId === updatedPackage.packageId ? updatedPackage : pkg,
      ),
    );
    setLockers((currentLockers) =>
      currentLockers.map((locker) =>
        locker.lockerId === updatedPackage.lockerId
          ? { ...locker, status: "available", currentPackageId: null }
          : locker,
      ),
    );
    setRetrievalPackage(updatedPackage);

    return updatedPackage;
  }, [retrievalPackage]);

  const resetCustomerFlow = useCallback(() => {
    setRetrievalPackage(null);
  }, []);

  const resetFlowProgress = useCallback(() => {
    resetAgentFlow();
    resetCustomerFlow();
  }, [resetAgentFlow, resetCustomerFlow]);

  const value = useMemo<FlowStateContextValue>(
    () => ({
      lockers,
      packages,
      selectedAgent,
      selectedPackageSize,
      latestDropOffPackage,
      retrievalPackage,
      beginAgentFlow,
      setSelectedPackageSize,
      confirmLockerDropOff,
      updateLatestDropOffTime,
      resetAgentFlow,
      selectRetrievalPackage,
      confirmRetrieval,
      resetCustomerFlow,
      resetFlowProgress,
    }),
    [
      lockers,
      packages,
      selectedAgent,
      selectedPackageSize,
      latestDropOffPackage,
      retrievalPackage,
      beginAgentFlow,
      confirmLockerDropOff,
      updateLatestDropOffTime,
      resetAgentFlow,
      selectRetrievalPackage,
      confirmRetrieval,
      resetCustomerFlow,
      resetFlowProgress,
    ],
  );

  return (
    <FlowStateContext.Provider value={value}>
      {children}
    </FlowStateContext.Provider>
  );
}
