import type { FastifyInstance } from "fastify";
import { registerAgentDropoffRoutes } from "./agent-dropoff.route";
import { registerAuthRoutes } from "./auth.route";
import { registerSystemRoutes } from "./system.route";

export async function registerApiRoutes(app: FastifyInstance) {
  await registerSystemRoutes(app);
  await registerAuthRoutes(app);
  await registerAgentDropoffRoutes(app);
}
