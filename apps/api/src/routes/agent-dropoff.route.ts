import type { FastifyInstance } from "fastify";
import {
  dropOffPackage,
  getLockersAvailability,
} from "@/controllers/agent-dropoff.controller";
import { authenticate } from "@/middleware/auth.middleware";
import {
  agentDropoffLockersQuerySchema,
  agentDropoffLockersResponseSchema,
  confirmAgentDropoffRequestSchema,
  confirmAgentDropoffResponseSchema,
  type AgentDropoffLockersQuery,
  type ConfirmAgentDropoffRequest,
} from "@/schemas/agent-dropoff";
import { apiErrorResponseSchema } from "@/schemas/shared";

export async function registerAgentDropoffRoutes(app: FastifyInstance) {
  app.get<{ Querystring: AgentDropoffLockersQuery }>("/agent/dropoff/lockers", {
    preHandler: authenticate,
    schema: {
      querystring: agentDropoffLockersQuerySchema,
      response: {
        200: agentDropoffLockersResponseSchema,
        400: apiErrorResponseSchema,
        401: apiErrorResponseSchema,
      },
    },
    handler: getLockersAvailability,
  });

  app.post<{ Body: ConfirmAgentDropoffRequest }>("/agent/dropoff", {
    preHandler: authenticate,
    schema: {
      body: confirmAgentDropoffRequestSchema,
      response: {
        201: confirmAgentDropoffResponseSchema,
        400: apiErrorResponseSchema,
        401: apiErrorResponseSchema,
        409: apiErrorResponseSchema,
      },
    },
    handler: dropOffPackage,
  });
}
