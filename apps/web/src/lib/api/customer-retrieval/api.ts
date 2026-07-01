import type {
  ConfirmCustomerRetrievalResponse,
  CustomerRetrievalCredentials,
  CustomerRetrievalLookupResponse,
} from "@/types";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { requestJson } from "@/lib/api/client";
import { mapCustomerRetrievalError } from "@/lib/api/customer-retrieval/messages";

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
