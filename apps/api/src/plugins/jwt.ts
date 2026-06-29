import fastifyJwt from "@fastify/jwt";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";

const jwtPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyJwt, {
    secret: app.config.JWT_SECRET,
  });

  app.decorate(
    "authenticate",
    async (request: FastifyRequest) => {
      await request.jwtVerify();
    },
  );
};

export default jwtPlugin;
