import type { FastifyPluginAsync } from "fastify";
import { createMongoConnection } from "../db/client";

const mongoPlugin: FastifyPluginAsync = async (app) => {
  const mongo = await createMongoConnection(app.config);

  app.decorate("mongo", {
    client: mongo.client,
    db: mongo.db,
    ping: mongo.ping,
  });

  app.addHook("onClose", async () => {
    await mongo.close();
  });
};

export default mongoPlugin;
