import { z } from "zod";

const customerRetrievalPayloadSchema = z.object({
  lockerId: z.string().trim().min(1, "Locker ID is required."),
  pickupCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pickup code must be a 6-digit numeric code."),
});

export const customerRetrievalLookupRequestSchema =
  customerRetrievalPayloadSchema;
export const confirmCustomerRetrievalRequestSchema =
  customerRetrievalPayloadSchema;

export type CustomerRetrievalLookupRequest = z.infer<
  typeof customerRetrievalLookupRequestSchema
>;
export type ConfirmCustomerRetrievalRequest = z.infer<
  typeof confirmCustomerRetrievalRequestSchema
>;
