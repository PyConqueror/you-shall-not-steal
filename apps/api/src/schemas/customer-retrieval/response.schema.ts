import { z } from "zod";
import {
  publicLockerSchema,
  storedPackageRecordSchema,
} from "@/schemas/agent-dropoff";

export const storageChargePreviewSchema = z.object({
  retrievedAt: z.string().datetime(),
  chargeableDays: z.number().int().nonnegative(),
  firstTierDays: z.number().int().nonnegative(),
  secondTierDays: z.number().int().nonnegative(),
  thirdTierDays: z.number().int().nonnegative(),
  firstTierAmount: z.number().nonnegative(),
  secondTierAmount: z.number().nonnegative(),
  thirdTierAmount: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
});

export const customerRetrievalLookupResponseSchema = z.object({
  package: storedPackageRecordSchema,
  locker: publicLockerSchema,
  chargePreview: storageChargePreviewSchema,
});

export const confirmCustomerRetrievalResponseSchema = z.object({
  package: storedPackageRecordSchema,
  locker: publicLockerSchema,
});

export type StorageChargePreviewResponse = z.infer<
  typeof storageChargePreviewSchema
>;
export type CustomerRetrievalLookupResponse = z.infer<
  typeof customerRetrievalLookupResponseSchema
>;
export type ConfirmCustomerRetrievalResponse = z.infer<
  typeof confirmCustomerRetrievalResponseSchema
>;
