import type { FastifyReply, FastifyRequest } from "fastify";
import { getAgentsCollection } from "../db/collections";
import { AppError } from "../errors/app-error";
import {
  agentLoginRequestSchema,
  type AgentLoginRequest,
} from "../schemas/auth/request.schema";
import type { AgentLoginResponse } from "../schemas/auth/response.schema";
import type { Agent } from "../types/entities";

function toPublicAgent(agent: Agent & { _id?: unknown }): Agent {
  return {
    agentId: agent.agentId,
    name: agent.name,
    status: agent.status,
  };
}

export async function loginAgentController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body: AgentLoginRequest = agentLoginRequestSchema.parse(request.body);
  const normalizedAgentId = body.agentId.trim();

  const agent = await getAgentsCollection(request.server.mongo.db).findOne({
    agentId: normalizedAgentId,
  });

  if (!agent) {
    throw new AppError({
      code: "AGENT_NOT_FOUND",
      message: "Agent ID is invalid.",
      statusCode: 404,
    });
  }

  if (agent.status !== "active") {
    throw new AppError({
      code: "AGENT_INACTIVE",
      message: "Agent account is inactive.",
      statusCode: 403,
    });
  }

  const expiresAt = new Date(
    Date.now() + request.server.config.AGENT_JWT_TTL_MINUTES * 60 * 1000,
  ).toISOString();

  const token = await reply.jwtSign(
    {
      sub: agent.agentId,
      role: "agent",
    },
    {
      expiresIn: `${request.server.config.AGENT_JWT_TTL_MINUTES}m`,
    },
  );

  const response: AgentLoginResponse = {
    token,
    expiresAt,
    agent: toPublicAgent(agent),
  };

  return reply.send(response);
}
