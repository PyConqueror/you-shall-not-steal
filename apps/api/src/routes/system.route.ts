import type { FastifyInstance } from "fastify";
import {
  getHealthController,
  getReadyController,
} from "@/controllers/system.controller";
import { apiErrorResponseSchema } from "@/schemas/shared";
import { healthResponseSchema, readyResponseSchema } from "@/schemas/system";

export async function registerSystemRoutes(app: FastifyInstance) {
  app.get("/health", {
    schema: {
      response: {
        200: healthResponseSchema,
      },
    },
    handler: getHealthController,
  });

  app.get("/ready", {
    schema: {
      response: {
        200: readyResponseSchema,
        503: apiErrorResponseSchema,
      },
    },
    handler: getReadyController,
  });
}
