import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { AppError } from "./app-error";

type NormalizedError = {
  code: string;
  message: string;
  statusCode: number;
};

function normalizeError(error: unknown): NormalizedError {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof ZodError) {
    return {
      code: "INVALID_REQUEST",
      message: "Request validation failed.",
      statusCode: 400,
    };
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    const statusCode = error.statusCode;
    const message =
      "message" in error && typeof error.message === "string"
        ? error.message
        : "Request failed.";

    return {
      code: statusCode === 401 ? "UNAUTHORIZED" : "REQUEST_ERROR",
      message,
      statusCode,
    };
  }

  return {
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred.",
    statusCode: 500,
  };
}

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    const normalizedError = normalizeError(error);
    const logPayload = {
      err: error,
      requestId: request.id,
      code: normalizedError.code,
      statusCode: normalizedError.statusCode,
    };

    if (normalizedError.statusCode >= 500) {
      request.log.error(logPayload, normalizedError.message);
    } else {
      request.log.warn(logPayload, normalizedError.message);
    }

    reply.status(normalizedError.statusCode).send({
      error: {
        code: normalizedError.code,
        message: normalizedError.message,
      },
    });
  });
}
