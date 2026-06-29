import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { AppConfig } from "./config/env";
import { registerErrorHandler } from "./errors/error-handler";
import { registerPlugins } from "./plugins";
import { registerRoutes } from "./routes";

type BuildAppOptions = {
  config: AppConfig;
};

export async function buildApp({
  config,
}: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
    },
  });

  app.decorate("config", config);

  registerErrorHandler(app);
  await registerPlugins(app);
  await registerRoutes(app);

  return app;
}
