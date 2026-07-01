import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Agent,
  FlowStateContextValue,
  PackageRecord,
  PackageSize,
  StorageChargePreview,
} from "@/types";
import { getAgentSession } from "@/feature/agent-auth/session";
import { FlowStateContext } from "@/state/flowState";

type FlowStateProviderProps = {
  children: ReactNode;
};

export function FlowStateProvider({ children }: FlowStateProviderProps) {
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
  const [retrievalChargePreview, setRetrievalChargePreview] =
    useState<StorageChargePreview | null>(null);

  const beginAgentFlow = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    setSelectedPackageSize(null);
    setLatestDropOffPackage(null);
  }, []);

  const recordAgentDropOff = useCallback((pkg: PackageRecord) => {
    setLatestDropOffPackage(pkg);
  }, []);

  const updateLatestDropOffTime = useCallback((newTime: string) => {
    setLatestDropOffPackage((currentPackage) => {
      if (!currentPackage) {
        return currentPackage;
      }

      return { ...currentPackage, droppedOffAt: newTime };
    });
  }, []);

  const resetAgentFlow = useCallback(() => {
    setSelectedAgent(null);
    setSelectedPackageSize(null);
    setLatestDropOffPackage(null);
  }, []);

  const selectRetrievalPackage = useCallback((
    pkg: PackageRecord,
    chargePreview: StorageChargePreview | null = null,
  ) => {
    setRetrievalPackage(pkg);
    setRetrievalChargePreview(chargePreview);
  }, []);

  const resetCustomerFlow = useCallback(() => {
    setRetrievalPackage(null);
    setRetrievalChargePreview(null);
  }, []);

  const resetFlowProgress = useCallback(() => {
    resetAgentFlow();
    resetCustomerFlow();
  }, [resetAgentFlow, resetCustomerFlow]);

  const value = useMemo<FlowStateContextValue>(
    () => ({
      selectedAgent,
      selectedPackageSize,
      latestDropOffPackage,
      retrievalPackage,
      retrievalChargePreview,
      beginAgentFlow,
      setSelectedPackageSize,
      recordAgentDropOff,
      updateLatestDropOffTime,
      resetAgentFlow,
      selectRetrievalPackage,
      resetCustomerFlow,
      resetFlowProgress,
    }),
    [
      selectedAgent,
      selectedPackageSize,
      latestDropOffPackage,
      retrievalPackage,
      retrievalChargePreview,
      beginAgentFlow,
      recordAgentDropOff,
      updateLatestDropOffTime,
      resetAgentFlow,
      selectRetrievalPackage,
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
