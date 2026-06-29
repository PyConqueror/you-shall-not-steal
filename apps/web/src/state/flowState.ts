import { createContext } from "react";
import type { Agent, Locker, PackageRecord, PackageSize } from "../types";

export type FlowStateContextValue = {
  lockers: Locker[];
  packages: PackageRecord[];
  selectedAgent: Agent | null;
  selectedPackageSize: PackageSize | null;
  latestDropOffPackage: PackageRecord | null;
  retrievalPackage: PackageRecord | null;
  beginAgentFlow: (agent: Agent) => void;
  setSelectedPackageSize: (size: PackageSize | null) => void;
  confirmLockerDropOff: (assignedLocker: Locker) => PackageRecord | null;
  updateLatestDropOffTime: (newTime: string) => void;
  resetAgentFlow: () => void;
  selectRetrievalPackage: (pkg: PackageRecord) => void;
  confirmRetrieval: (retrievedAt: string) => PackageRecord | null;
  resetCustomerFlow: () => void;
  resetFlowProgress: () => void;
};

export const FlowStateContext = createContext<FlowStateContextValue | undefined>(
  undefined,
);
