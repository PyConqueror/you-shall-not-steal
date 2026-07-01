import type { FastifyInstance } from "fastify";
import { sendEmail } from "@/controllers/email.controller";
import { authenticate } from "@/middleware/auth.middleware";
import {
  sendEmailRequestSchema,
  sendEmailResponseSchema,
  type SendEmailRequest,
} from "@/schemas/email";
import { apiErrorResponseSchema } from "@/schemas/shared";

export async function registerEmailRoutes(app: FastifyInstance) {
  app.post<{ Body: SendEmailRequest }>("/agent/dropoff/email", {
    preHandler: authenticate,
    schema: {
      body: sendEmailRequestSchema,
      response: {
        200: sendEmailResponseSchema,
        400: apiErrorResponseSchema,
        401: apiErrorResponseSchema,
        404: apiErrorResponseSchema,
        409: apiErrorResponseSchema,
        502: apiErrorResponseSchema,
        503: apiErrorResponseSchema,
      },
    },
    handler: sendEmail,
  });
}
