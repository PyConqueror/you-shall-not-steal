import type { ApiErrorResponse } from "@/types";

export class ApiError extends Error {
  readonly code?: string;
  readonly statusCode: number;

  constructor(
    message: string,
    { code, statusCode }: { code?: string; statusCode: number },
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function createApiError(
  message: string,
  payload: ApiErrorResponse | null,
  statusCode: number,
): ApiError {
  return new ApiError(message, {
    code: payload?.error?.code,
    statusCode,
  });
}
