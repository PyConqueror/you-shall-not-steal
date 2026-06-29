import type { FastifyPluginAsync } from "fastify";
import { AppError } from "../errors/app-error";

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  });

  app.get("/ready", async () => {
    try {
      await app.mongo.ping();

      return {
        status: "ready",
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new AppError({
        code: "DATABASE_UNAVAILABLE",
        message: "Database readiness check failed.",
        statusCode: 503,
      });
    }
  });
};

export default healthRoutes;
