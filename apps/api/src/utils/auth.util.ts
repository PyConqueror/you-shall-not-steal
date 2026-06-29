import { Agent } from "@/types/entities";

export function toPublicAgent(agent: Agent & { _id?: unknown }): Agent {
    return {
      agentId: agent.agentId,
      name: agent.name,
      status: agent.status,
    };
  }