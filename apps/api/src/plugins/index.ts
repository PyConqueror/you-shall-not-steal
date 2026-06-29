import type { FastifyInstance } from "fastify";
import corsPlugin from "./cors";
import helmetPlugin from "./helmet";
import jwtPlugin from "./jwt";
import mongoPlugin from "./mongo";

export async function registerPlugins(app: FastifyInstance) {
  await app.register(corsPlugin);
  await app.register(helmetPlugin);
  await app.register(jwtPlugin);
  await app.register(mongoPlugin);
}
