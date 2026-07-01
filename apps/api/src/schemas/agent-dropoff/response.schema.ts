import { z } from "zod";

const packageSizeValues = ["small", "medium", "large"] as const;
const lockerStatusValues = ["available", "occupied", "maintenance"] as const;
const packageStatusValues = ["stored", "retrieved"] as const;

export const publicLockerSchema = z.object({
  id: z.string(),
  lockerId: z.string(),
  size: z.enum(packageSizeValues),
  status: z.enum(lockerStatusValues),
  currentPackageId: z.string().nullable().optional(),
});

export const storedPackageRecordSchema = z.object({
  packageId: z.string(),
  agentId: z.string(),
  lockerId: z.string(),
  packageSize: z.enum(packageSizeValues),
  pickupCode: z.string(),
  customerEmail: z.string().email().nullable(),
  status: z.enum(packageStatusValues),
  droppedOffAt: z.string().datetime(),
  retrievedAt: z.string().datetime().nullable().optional(),
  storageChargeAmount: z.number().optional(),
  chargeableDays: z.number().int().nonnegative().optional(),
});

export const agentDropoffLockersResponseSchema = z.object({
  lockers: z.array(publicLockerSchema),
  recommendedLocker: publicLockerSchema.nullable(),
});

export const confirmAgentDropoffResponseSchema = z.object({
  package: storedPackageRecordSchema,
  locker: publicLockerSchema,
});

export const updateAgentDropoffTimeResponseSchema = z.object({
  package: storedPackageRecordSchema,
});

export type PublicLockerResponse = z.infer<typeof publicLockerSchema>;
export type StoredPackageRecordResponse = z.infer<typeof storedPackageRecordSchema>;
export type AgentDropoffLockersResponse = z.infer<
  typeof agentDropoffLockersResponseSchema
>;
export type ConfirmAgentDropoffResponse = z.infer<
  typeof confirmAgentDropoffResponseSchema
>;
export type UpdateAgentDropoffTimeResponse = z.infer<
  typeof updateAgentDropoffTimeResponseSchema
>;
