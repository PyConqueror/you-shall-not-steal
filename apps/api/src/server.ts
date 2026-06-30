import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import * as config from "@/config";
import { seedDatabaseIfEmpty } from "@/db/seed";
import { registerErrorHandler } from "@/middleware/error-handler.middleware";
import { registerAllPlugins } from "@/plugins";
import { registerApiRoutes } from "@/routes";

export async function buildServer(
  env: config.Env,
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await registerAllPlugins(app, env);
  registerErrorHandler(app);
  await registerApiRoutes(app);

  return app;
}

export async function bootstrapServer(): Promise<FastifyInstance> {
  const env = await config.loadEnv();
  await config.connectToDatabase(env);

  if (env.NODE_ENV !== "production") {
    const { db } = config.getDatabaseConnection();
    await seedDatabaseIfEmpty(db);
  }

  const app = await buildServer(env);
  await app.ready();
  return app;
}

export async function startServer() {
  const app = await bootstrapServer();
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    app.log.info({ signal }, "Shutting down API server");

    try {
      await app.close();
      await config.disconnectFromDatabase();
      process.exit(0);
    } catch (error) {
      app.log.error({ err: error, signal }, "Failed to shut down cleanly");
      process.exit(1);
    }
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  const env = app.config;

  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT,
    });
  } catch (error) {
    app.log.error(error);
    await config.disconnectFromDatabase().catch(() => undefined);
    process.exit(1);
  }
}
