import { z } from "zod";

const packageSizeValues = ["small", "medium", "large"] as const;

export const agentDropoffLockersQuerySchema = z.object({
  packageSize: z.enum(packageSizeValues),
});

export const confirmAgentDropoffRequestSchema = z.object({
  packageSize: z.enum(packageSizeValues),
  lockerId: z.string().trim().min(1, "Locker ID is required."),
});

export const updateAgentDropoffTimeRequestSchema = z.object({
  packageId: z.string().trim().min(1, "Package ID is required."),
  droppedOffAt: z.string().datetime(),
});

export type AgentDropoffLockersQuery = z.infer<
  typeof agentDropoffLockersQuerySchema
>;
export type ConfirmAgentDropoffRequest = z.infer<
  typeof confirmAgentDropoffRequestSchema
>;
export type UpdateAgentDropoffTimeRequest = z.infer<
  typeof updateAgentDropoffTimeRequestSchema
>;
