import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { getAgentsCollection } from "../db/collections";
import { AppError } from "../errors/app-error";
import type { Agent } from "../types/domain";

const agentLoginBodySchema = z.object({
  agentId: z.string().trim().min(1, "Agent ID is required."),
});

function toPublicAgent(agent: Agent & { _id?: unknown }): Agent {
  return {
    agentId: agent.agentId,
    name: agent.name,
    status: agent.status,
  };
}

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/agent/login", async (request, reply) => {
    const body = agentLoginBodySchema.parse(request.body);
    const normalizedAgentId = body.agentId.trim();

    const agent = await getAgentsCollection(app.mongo.db).findOne({
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
      Date.now() + app.config.AGENT_JWT_TTL_MINUTES * 60 * 1000,
    ).toISOString();

    const token = await reply.jwtSign(
      {
        sub: agent.agentId,
        role: "agent",
      },
      {
        expiresIn: `${app.config.AGENT_JWT_TTL_MINUTES}m`,
      },
    );

    return {
      token,
      expiresAt,
      agent: toPublicAgent(agent),
    };
  });
};

export default authRoutes;
