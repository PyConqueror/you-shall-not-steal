import type { FastifyInstance } from "fastify";
import {
  confirmCustomerRetrieval,
  lookupCustomerRetrieval,
} from "@/controllers/customer-retrieval.controller";
import {
  confirmCustomerRetrievalRequestSchema,
  confirmCustomerRetrievalResponseSchema,
  customerRetrievalLookupRequestSchema,
  customerRetrievalLookupResponseSchema,
  type ConfirmCustomerRetrievalRequest,
  type CustomerRetrievalLookupRequest,
} from "@/schemas/customer-retrieval";
import { apiErrorResponseSchema } from "@/schemas/shared";

export async function registerCustomerRetrievalRoutes(app: FastifyInstance) {
  app.post<{ Body: CustomerRetrievalLookupRequest }>("/customer/retrieval/lookup", {
    schema: {
      body: customerRetrievalLookupRequestSchema,
      response: {
        200: customerRetrievalLookupResponseSchema,
        400: apiErrorResponseSchema,
        404: apiErrorResponseSchema,
        409: apiErrorResponseSchema,
      },
    },
    handler: lookupCustomerRetrieval,
  });

  app.post<{ Body: ConfirmCustomerRetrievalRequest }>(
    "/customer/retrieval/confirm",
    {
      schema: {
        body: confirmCustomerRetrievalRequestSchema,
        response: {
          200: confirmCustomerRetrievalResponseSchema,
          400: apiErrorResponseSchema,
          404: apiErrorResponseSchema,
          409: apiErrorResponseSchema,
        },
      },
      handler: confirmCustomerRetrieval,
    },
  );
}
