import { createApiError, type ApiErrorResponse } from "@/lib/api/errors";

export function mapAgentAuthError(
  payload: ApiErrorResponse | null,
  statusCode: number,
) {
  let message: string;

  switch (payload?.error?.code) {
    case "AGENT_NOT_FOUND":
      message = "Invalid Agent ID. Please check your ID and try again.";
      break;
    case "AGENT_INACTIVE":
      message = "This agent account is inactive.";
      break;
    case "INVALID_REQUEST":
      message = "Please enter an Agent ID.";
      break;
    default:
      message =
        payload?.error?.message ??
        "Unable to log in right now. Please try again.";
  }

  return createApiError(message, payload, statusCode);
}
