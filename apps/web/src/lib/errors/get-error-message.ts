import { ApiError } from "@/lib/api/errors";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function isUnauthorizedApiError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.statusCode === 401 || error.code === "UNAUTHORIZED")
  );
}
