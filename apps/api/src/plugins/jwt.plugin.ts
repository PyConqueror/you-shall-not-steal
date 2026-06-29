import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";

export async function registerJwtPlugin(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: app.config.JWT_SECRET,
  });
}
