import type { FastifyInstance, FastifyRequest } from "fastify";
import { getDatabaseConnection } from "@/config";

export function registerDecorators(app: FastifyInstance) {
  const mongo = getDatabaseConnection();

  app.decorate("mongo", {
    client: mongo.client,
    db: mongo.db,
    ping: mongo.ping,
  });

  app.decorate("authenticate", async (request: FastifyRequest) => {
    await request.jwtVerify();
  });
}
