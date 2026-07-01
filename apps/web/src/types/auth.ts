import type { Agent } from "@/types/domain";

export type AgentSession = {
  token: string;
  expiresAt: string;
  agent: Agent;
};
