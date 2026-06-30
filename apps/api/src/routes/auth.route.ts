import type { FastifyInstance } from "fastify";
import { loginAgentController } from "@/controllers/auth.controller";
import {
  agentLoginRequestSchema,
  agentLoginResponseSchema,
} from "@/schemas/auth";
import { apiErrorResponseSchema } from "@/schemas/shared";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/agent/login", {
    schema: {
      body: agentLoginRequestSchema,
      response: {
        200: agentLoginResponseSchema,
        400: apiErrorResponseSchema,
        403: apiErrorResponseSchema,
        404: apiErrorResponseSchema,
      },
    },
    handler: loginAgentController,
  });
}
