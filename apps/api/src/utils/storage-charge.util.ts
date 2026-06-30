import type {
  StorageChargeBreakdown,
  StorageChargePreview,
} from "@/types/storage-charge";

const DAY_IN_HOURS = 24;
const BASE_DAILY_RATE = 2;

export function calculateChargeableDays(
  droppedOffAt: string,
  retrievedAt: string,
): number {
  const dropOffDate = new Date(droppedOffAt);
  const retrievalDate = new Date(retrievedAt);

  const diffInMs = retrievalDate.getTime() - dropOffDate.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);

  return Math.max(0, Math.floor(diffInHours / DAY_IN_HOURS));
}

export function calculateStorageCharge(
  droppedOffAt: string,
  retrievedAt: string,
): StorageChargeBreakdown {
  const chargeableDays = calculateChargeableDays(droppedOffAt, retrievedAt);

  const firstTierDays = Math.min(chargeableDays, 5);
  const secondTierDays = Math.min(Math.max(chargeableDays - 5, 0), 5);
  const thirdTierDays = Math.max(chargeableDays - 10, 0);

  const firstTierAmount = firstTierDays * BASE_DAILY_RATE;
  const secondTierAmount = secondTierDays * BASE_DAILY_RATE * 2;
  const thirdTierAmount = thirdTierDays * BASE_DAILY_RATE * 3;

  return {
    chargeableDays,
    firstTierDays,
    secondTierDays,
    thirdTierDays,
    firstTierAmount,
    secondTierAmount,
    thirdTierAmount,
    totalAmount: firstTierAmount + secondTierAmount + thirdTierAmount,
  };
}

export function createStorageChargePreview(
  droppedOffAt: string,
  retrievedAt = new Date().toISOString(),
): StorageChargePreview {
  return {
    retrievedAt,
    ...calculateStorageCharge(droppedOffAt, retrievedAt),
  };
}
