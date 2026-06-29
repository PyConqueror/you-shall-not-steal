import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import type { FastifyInstance } from "fastify";

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

export async function registerSecurityPlugins(app: FastifyInstance) {
  await app.register(fastifyCors, {
    origin: parseCorsOrigins(app.config.CORS_ORIGIN),
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });

  await app.register(fastifyHelmet);
}
