import { z } from "zod";
import { storedPackageRecordSchema } from "@/schemas/agent-dropoff";

export const sendEmailResponseSchema = z.object({
  package: storedPackageRecordSchema,
});

export type SendEmailResponse = z.infer<typeof sendEmailResponseSchema>;
