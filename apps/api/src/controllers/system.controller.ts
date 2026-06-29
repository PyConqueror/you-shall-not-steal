import type { FastifyReply, FastifyRequest } from "fastify";
import { pingDatabase } from "../config/db.config";
import { AppError } from "../errors/app-error";
import type {
  HealthResponse,
  ReadyResponse,
} from "../schemas/system/response.schema";

export async function getHealthController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  return reply.send(response);
}

export async function getReadyController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await pingDatabase();

    const response: ReadyResponse = {
      status: "ready",
      timestamp: new Date().toISOString(),
    };

    return reply.send(response);
  } catch {
    throw new AppError({
      code: "DATABASE_UNAVAILABLE",
      message: "Database readiness check failed.",
      statusCode: 503,
    });
  }
}
