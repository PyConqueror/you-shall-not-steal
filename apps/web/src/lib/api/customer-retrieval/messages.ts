import { createApiError } from "@/lib/api/errors";
import type { ApiErrorResponse } from "@/types";

export function mapCustomerRetrievalError(
  payload: ApiErrorResponse | null,
  statusCode: number,
) {
  let message: string;

  switch (payload?.error?.code) {
    case "INVALID_LOCKER_OR_PICKUP_CODE":
      message = "Invalid Locker ID or Pickup Code.";
      break;
    case "PACKAGE_ALREADY_RETRIEVED":
      message = "This package has already been retrieved.";
      break;
    case "LOCKER_STATE_MISMATCH":
      message =
        "The locker is no longer ready for retrieval. Please start again.";
      break;
    case "INVALID_REQUEST":
      message = "Please check the Locker ID and Pickup Code format.";
      break;
    default:
      if (statusCode === 404) {
        message = "Invalid Locker ID or Pickup Code.";
      } else {
        message =
          payload?.error?.message ??
          "Unable to continue the retrieval right now. Please try again.";
      }
  }

  return createApiError(message, payload, statusCode);
}
