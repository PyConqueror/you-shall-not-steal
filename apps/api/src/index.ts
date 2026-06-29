import { buildApp } from "./app";
import { loadEnv } from "./config/env";

async function start() {
  const config = loadEnv();
  const app = await buildApp({ config });
  let shuttingDown = false;

  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    app.log.info({ signal }, "Shutting down API server");

    try {
      await app.close();
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

  await app.listen({
    host: config.HOST,
    port: config.PORT,
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
