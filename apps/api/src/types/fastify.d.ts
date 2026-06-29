import "@fastify/jwt";
import "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Db, MongoClient } from "mongodb";
import type { Env } from "../config/env.config";
import type { AgentJwtPayload } from "./auth";

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
    mongo: {
      client: MongoClient;
      db: Db;
      ping: () => Promise<void>;
    };
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AgentJwtPayload;
    user: AgentJwtPayload;
  }
}
