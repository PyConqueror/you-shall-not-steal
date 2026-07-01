import { createContext } from "react";
import type { FlowStateContextValue } from "@/types";

export const FlowStateContext = createContext<FlowStateContextValue | undefined>(
  undefined,
);
