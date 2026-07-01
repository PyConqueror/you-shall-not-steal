import type { Db } from "mongodb";
import { AppError } from "@/errors/app-error";
import { getAgentsCollection } from "@/models";
import type { AgentDocument } from "@/types/documents";
import type { Agent } from "@/types/entities";

export async function resolveAuthenticatedAgent(
  db: Db,
  agentId: string,
): Promise<AgentDocument> {
  const agent = await getAgentsCollection(db).findOne({ agentId });

  if (!agent) {
    throw new AppError({
      code: "AUTHENTICATED_AGENT_NOT_FOUND",
      message: "Authenticated agent could not be resolved.",
      statusCode: 401,
    });
  }

  return agent;
}

export function toPublicAgent(agent: Agent & { _id?: unknown }): Agent {
  return {
    agentId: agent.agentId,
    name: agent.name,
    status: agent.status,
  };
}
