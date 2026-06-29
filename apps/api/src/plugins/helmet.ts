import fastifyHelmet from "@fastify/helmet";
import type { FastifyPluginAsync } from "fastify";

const helmetPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyHelmet);
};

export default helmetPlugin;
