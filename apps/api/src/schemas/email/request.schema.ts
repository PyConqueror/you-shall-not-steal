import { z } from "zod";

export const sendEmailRequestSchema = z.object({
  packageId: z.string().trim().min(1, "Package ID is required."),
  customerEmail: z
    .string()
    .trim()
    .email("A valid customer email is required."),
});

export type SendEmailRequest = z.infer<typeof sendEmailRequestSchema>;
