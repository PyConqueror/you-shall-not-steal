import { useContext } from "react";
import { FlowStateContext } from "@/state/flowState";

export function useFlowState() {
  const context = useContext(FlowStateContext);
  if (!context) {
    throw new Error("useFlowState must be used within FlowStateProvider");
  }

  return context;
}
