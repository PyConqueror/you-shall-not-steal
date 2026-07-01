import type { Locker, PackageRecord, StorageChargePreview } from "@/types";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { requestJson } from "@/lib/api/client";
import { mapCustomerRetrievalError } from "@/lib/api/customer-retrieval/messages";

export type CustomerRetrievalCredentials = {
  lockerId: string;
  pickupCode: string;
};

export type CustomerRetrievalLookupResponse = {
  package: PackageRecord;
  locker: Locker;
  chargePreview: StorageChargePreview;
};

export type ConfirmCustomerRetrievalResponse = {
  package: PackageRecord;
  locker: Locker;
};

export async function lookupCustomerRetrieval(
  input: CustomerRetrievalCredentials,
): Promise<CustomerRetrievalLookupResponse> {
  return requestJson<CustomerRetrievalLookupResponse>(
    `${getApiBaseUrl()}/customer/retrieval/lookup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    mapCustomerRetrievalError,
  );
}

export async function confirmCustomerRetrieval(
  input: CustomerRetrievalCredentials,
): Promise<ConfirmCustomerRetrievalResponse> {
  return requestJson<ConfirmCustomerRetrievalResponse>(
    `${getApiBaseUrl()}/customer/retrieval/confirm`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    mapCustomerRetrievalError,
  );
}
