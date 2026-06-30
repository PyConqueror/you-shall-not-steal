export type StorageChargeBreakdown = {
  chargeableDays: number;
  firstTierDays: number;
  secondTierDays: number;
  thirdTierDays: number;
  firstTierAmount: number;
  secondTierAmount: number;
  thirdTierAmount: number;
  totalAmount: number;
};

export type StorageChargePreview = StorageChargeBreakdown & {
  retrievedAt: string;
};
