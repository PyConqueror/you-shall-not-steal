import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createMockPackages, mockLockers } from "shared";
import type { Agent, Locker, PackageRecord, PackageSize } from "../types";
import { calculateStorageCharge } from "../utils/storageCharges";
import { getAgentSession } from "../api/agent-auth/session";
import { FlowStateContext, type FlowStateContextValue } from "./flowState";

type FlowStateProviderProps = {
  children: ReactNode;
};

export function FlowStateProvider({ children }: FlowStateProviderProps) {
  const [lockers, setLockers] = useState<Locker[]>(mockLockers);
  const [packages, setPackages] = useState<PackageRecord[]>(() =>
    createMockPackages(),
  );
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

  const recordAgentDropOff = useCallback(
    (pkg: PackageRecord, assignedLocker: Locker) => {
      setPackages((currentPackages) => {
        const packagesWithoutDuplicate = currentPackages.filter(
          (currentPackage) => currentPackage.packageId !== pkg.packageId,
        );

        return [...packagesWithoutDuplicate, pkg];
      });

      setLockers((currentLockers) => {
        const lockerIndex = currentLockers.findIndex((locker) => {
          return (
            locker.id === assignedLocker.id ||
            locker.lockerId === assignedLocker.lockerId
          );
        });

        if (lockerIndex === -1) {
          return [...currentLockers, assignedLocker];
        }

        return currentLockers.map((locker, index) =>
          index === lockerIndex ? assignedLocker : locker,
        );
      });

      setLatestDropOffPackage(pkg);
    },
    [],
  );

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
      recordAgentDropOff,
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
      recordAgentDropOff,
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
