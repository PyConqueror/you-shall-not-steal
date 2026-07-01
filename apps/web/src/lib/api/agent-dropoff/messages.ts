import { createApiError, type ApiErrorResponse } from "@/lib/api/errors";

export function mapAgentDropoffError(
  payload: ApiErrorResponse | null,
  statusCode: number,
) {
  let message: string;

  switch (payload?.error?.code) {
    case "UNAUTHORIZED":
      message = "Your session expired. Please sign in again.";
      break;
    case "NO_SUITABLE_LOCKER":
      message =
        "No suitable locker is available right now. Please try again later.";
      break;
    case "LOCKER_NOT_FOUND":
    case "LOCKER_UNAVAILABLE":
    case "LOCKER_RECOMMENDATION_CHANGED":
      message =
        "That locker is no longer available. Please refresh and try again.";
      break;
    case "LOCKER_SIZE_MISMATCH":
      message =
        "The recommended locker no longer matches this package size.";
      break;
    case "PACKAGE_NOT_FOUND":
      message =
        "This package could not be found. Please restart the drop-off flow.";
      break;
    case "PACKAGE_ALREADY_RETRIEVED":
      message =
        "This package was already retrieved and cannot be updated.";
      break;
    case "CUSTOMER_EMAIL_ALREADY_SENT":
      message = "Pickup details were already emailed for this package.";
      break;
    case "CUSTOMER_EMAIL_NOT_CONFIGURED":
      message = "Customer email sending is not configured on the server yet.";
      break;
    case "CUSTOMER_EMAIL_SEND_FAILED":
      message = "We couldn't send the email right now. Please try again.";
      break;
    case "INVALID_REQUEST":
      message = "The drop-off request was invalid. Please try again.";
      break;
    default:
      if (statusCode === 401) {
        message = "Your session expired. Please sign in again.";
      } else {
        message =
          payload?.error?.message ??
          "Unable to complete the drop-off right now. Please try again.";
      }
  }

  return createApiError(message, payload, statusCode);
}
