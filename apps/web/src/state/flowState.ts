import { createContext } from "react";
import type {
  Agent,
  PackageRecord,
  PackageSize,
  StorageChargePreview,
} from "@/types";

export type FlowStateContextValue = {
  selectedAgent: Agent | null;
  selectedPackageSize: PackageSize | null;
  latestDropOffPackage: PackageRecord | null;
  retrievalPackage: PackageRecord | null;
  retrievalChargePreview: StorageChargePreview | null;
  beginAgentFlow: (agent: Agent) => void;
  setSelectedPackageSize: (size: PackageSize | null) => void;
  recordAgentDropOff: (pkg: PackageRecord) => void;
  updateLatestDropOffTime: (newTime: string) => void;
  resetAgentFlow: () => void;
  selectRetrievalPackage: (
    pkg: PackageRecord,
    chargePreview?: StorageChargePreview | null,
  ) => void;
  resetCustomerFlow: () => void;
  resetFlowProgress: () => void;
};

export const FlowStateContext = createContext<FlowStateContextValue | undefined>(
  undefined,
);
