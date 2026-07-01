import type { PackageLockerResult } from "@/types/api/common";
import type { StorageChargePreview } from "@/types/storage-charge";

export type CustomerRetrievalCredentials = {
  lockerId: string;
  pickupCode: string;
};

export type CustomerRetrievalLookupResponse = PackageLockerResult & {
  chargePreview: StorageChargePreview;
};

export type ConfirmCustomerRetrievalResponse = PackageLockerResult;
