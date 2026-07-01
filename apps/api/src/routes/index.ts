import type { FastifyInstance } from "fastify";
import { registerEmailRoutes } from "./email.route";
import { registerAgentDropoffRoutes } from "./agent-dropoff.route";
import { registerAuthRoutes } from "./auth.route";
import { registerCustomerRetrievalRoutes } from "./customer-retrieval.route";
import { registerSystemRoutes } from "./system.route";

export async function registerApiRoutes(app: FastifyInstance) {
  await registerSystemRoutes(app);
  await registerAuthRoutes(app);
  await registerAgentDropoffRoutes(app);
  await registerEmailRoutes(app);
  await registerCustomerRetrievalRoutes(app);
}
