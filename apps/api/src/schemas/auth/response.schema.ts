import { z } from "zod";

export const publicAgentSchema = z.object({
  agentId: z.string(),
  name: z.string(),
  status: z.enum(["active", "inactive"]),
});

export const agentLoginResponseSchema = z.object({
  token: z.string(),
  expiresAt: z.string().datetime(),
  agent: publicAgentSchema,
});

export type AgentLoginResponse = z.infer<typeof agentLoginResponseSchema>;
