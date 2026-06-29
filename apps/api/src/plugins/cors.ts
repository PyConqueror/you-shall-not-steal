import fastifyCors from "@fastify/cors";
import type { FastifyPluginAsync } from "fastify";

function parseCorsOrigins(corsOrigin: string): true | string[] {
  const origins = corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0 || origins.includes("*")) {
    return true;
  }

  return origins;
}

const corsPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyCors, {
    origin: parseCorsOrigins(app.config.CORS_ORIGIN),
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });
};

export default corsPlugin;
