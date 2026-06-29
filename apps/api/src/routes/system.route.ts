import type { FastifyInstance } from "fastify";
import {
  getHealthController,
  getReadyController,
} from "@/controllers/system.controller";

export async function registerSystemRoutes(app: FastifyInstance) {
  app.get("/health", getHealthController);
  app.get("/ready", getReadyController);
}
