import { z } from "zod";

export const agentLoginRequestSchema = z.object({
  agentId: z.string().trim().min(1, "Agent ID is required."),
});

export type AgentLoginRequest = z.infer<typeof agentLoginRequestSchema>;
