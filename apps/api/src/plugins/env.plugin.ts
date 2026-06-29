import type { FastifyInstance } from "fastify";
import type { Env } from "@/config";

export async function registerEnvPlugin(app: FastifyInstance, config: Env) {
  app.decorate("config", config);
}
