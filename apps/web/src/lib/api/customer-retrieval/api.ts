import type { Locker, PackageRecord, StorageChargePreview } from "@/types";
import { getApiBaseUrl } from "@/lib/api/base-url";

type CustomerRetrievalErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

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

export class CustomerRetrievalApiError extends Error {
  readonly code?: string;
  readonly statusCode: number;

  constructor(
    message: string,
    { code, statusCode }: { code?: string; statusCode: number },
  ) {
    super(message);
    this.name = "CustomerRetrievalApiError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

function toCustomerRetrievalErrorMessage(
  payload: CustomerRetrievalErrorResponse | null,
  statusCode: number,
) {
  switch (payload?.error?.code) {
    case "INVALID_LOCKER_OR_PICKUP_CODE":
      return "Invalid Locker ID or Pickup Code.";
    case "PACKAGE_ALREADY_RETRIEVED":
      return "This package has already been retrieved.";
    case "LOCKER_STATE_MISMATCH":
      return "The locker is no longer ready for retrieval. Please start again.";
    case "INVALID_REQUEST":
      return "Please check the Locker ID and Pickup Code format.";
    default:
      if (statusCode === 404) {
        return "Invalid Locker ID or Pickup Code.";
      }

      return (
        payload?.error?.message ??
        "Unable to continue the retrieval right now. Please try again."
      );
  }
}

function toCustomerRetrievalApiError(
  payload: CustomerRetrievalErrorResponse | null,
  statusCode: number,
) {
  return new CustomerRetrievalApiError(
    toCustomerRetrievalErrorMessage(payload, statusCode),
    {
      code: payload?.error?.code,
      statusCode,
    },
  );
}

async function parseResponsePayload<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

export async function lookupCustomerRetrieval(
  input: CustomerRetrievalCredentials,
): Promise<CustomerRetrievalLookupResponse> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}/customer/retrieval/lookup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  } catch {
    throw new CustomerRetrievalApiError(
      "Unable to reach the server. Please try again.",
      {
        code: "NETWORK_ERROR",
        statusCode: 0,
      },
    );
  }

  const payload = await parseResponsePayload<
    CustomerRetrievalLookupResponse | CustomerRetrievalErrorResponse
  >(response);

  if (!response.ok) {
    throw toCustomerRetrievalApiError(
      payload as CustomerRetrievalErrorResponse | null,
      response.status,
    );
  }

  return payload as CustomerRetrievalLookupResponse;
}

export async function confirmCustomerRetrieval(
  input: CustomerRetrievalCredentials,
): Promise<ConfirmCustomerRetrievalResponse> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}/customer/retrieval/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  } catch {
    throw new CustomerRetrievalApiError(
      "Unable to reach the server. Please try again.",
      {
        code: "NETWORK_ERROR",
        statusCode: 0,
      },
    );
  }

  const payload = await parseResponsePayload<
    ConfirmCustomerRetrievalResponse | CustomerRetrievalErrorResponse
  >(response);

  if (!response.ok) {
    throw toCustomerRetrievalApiError(
      payload as CustomerRetrievalErrorResponse | null,
      response.status,
    );
  }

  return payload as ConfirmCustomerRetrievalResponse;
}
