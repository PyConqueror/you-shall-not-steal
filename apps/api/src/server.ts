import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as config from "./config/index.config";
import { registerErrorHandler } from "./middleware/error-handler.middleware";
import { registerAllPlugins } from "./plugins/index.plugin";
import { registerApiRoutes } from "./routes/index.route";

export async function buildServer(
  env: config.Env,
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
  });

  await registerAllPlugins(app, env);
  registerErrorHandler(app);
  await registerApiRoutes(app);

  return app;
}

export async function startServer() {
  const env = await config.loadEnv();
  await config.connectToDatabase(env);

  const app = await buildServer(env);
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

const currentFilePath = fileURLToPath(import.meta.url);
const isDirectExecution =
  typeof process.argv[1] === "string" &&
  resolve(process.argv[1]) === currentFilePath;

if (isDirectExecution) {
  startServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
