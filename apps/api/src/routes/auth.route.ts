import type { FastifyInstance } from "fastify";
import { loginAgentController } from "../controllers/auth.controller";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/agent/login", loginAgentController);
}
