import { z } from "zod";

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const apiErrorResponseSchema = z.object({
  error: apiErrorSchema,
});
