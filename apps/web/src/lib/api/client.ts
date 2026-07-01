import {
  ApiError,
  type ApiErrorResponse,
  createApiError,
} from "@/lib/api/errors";

const NETWORK_ERROR_MESSAGE = "Unable to reach the server. Please try again.";

export async function parseJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

export function createNetworkError(): ApiError {
  return new ApiError(NETWORK_ERROR_MESSAGE, {
    code: "NETWORK_ERROR",
    statusCode: 0,
  });
}

type MapApiError = (
  payload: ApiErrorResponse | null,
  statusCode: number,
) => ApiError;

export async function requestJson<T>(
  url: string,
  init: RequestInit,
  mapError: MapApiError,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch {
    throw createNetworkError();
  }

  const payload = await parseJson<T | ApiErrorResponse>(response);

  if (!response.ok) {
    throw mapError(payload as ApiErrorResponse | null, response.status);
  }

  return payload as T;
}
