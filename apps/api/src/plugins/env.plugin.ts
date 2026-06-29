import type { FastifyInstance } from "fastify";
import type { Env } from "../config/env.config";

export async function registerEnvPlugin(app: FastifyInstance, config: Env) {
  app.decorate("config", config);
}
