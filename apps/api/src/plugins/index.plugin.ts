import type { FastifyInstance } from "fastify";
import type { Env } from "../config/env.config";
import { registerDecorators } from "./decorators.plugin";
import { registerEnvPlugin } from "./env.plugin";
import { registerJwtPlugin } from "./jwt.plugin";
import { registerSecurityPlugins } from "./security.plugin";

export async function registerAllPlugins(app: FastifyInstance, config: Env) {
  await registerEnvPlugin(app, config);
  await registerSecurityPlugins(app);
  await registerJwtPlugin(app);
  registerDecorators(app);
}
