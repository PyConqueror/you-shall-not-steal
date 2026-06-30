import type { Locker, PackageRecord, PackageSize } from "../../types";
import { getApiBaseUrl } from "../base-url";

type AgentDropoffErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export type AgentDropoffLockersResponse = {
  lockers: Locker[];
  recommendedLocker: Locker | null;
};

export type ConfirmAgentDropoffInput = {
  packageSize: PackageSize;
  lockerId: string;
};

export type ConfirmAgentDropoffResponse = {
  package: PackageRecord;
  locker: Locker;
};

export type UpdateAgentDropoffTimeInput = {
  packageId: string;
  droppedOffAt: string;
};

export type UpdateAgentDropoffTimeResponse = {
  package: PackageRecord;
};

export class AgentDropoffApiError extends Error {
  readonly code?: string;
  readonly statusCode: number;

  constructor(
    message: string,
    { code, statusCode }: { code?: string; statusCode: number },
  ) {
    super(message);
    this.name = "AgentDropoffApiError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function toAgentDropoffErrorMessage(
  payload: AgentDropoffErrorResponse | null,
  statusCode: number,
) {
  switch (payload?.error?.code) {
    case "UNAUTHORIZED":
      return "Your session expired. Please sign in again.";
    case "NO_SUITABLE_LOCKER":
      return "No suitable locker is available right now. Please try again later.";
    case "LOCKER_NOT_FOUND":
    case "LOCKER_UNAVAILABLE":
    case "LOCKER_RECOMMENDATION_CHANGED":
      return "That locker is no longer available. Please refresh and try again.";
    case "LOCKER_SIZE_MISMATCH":
      return "The recommended locker no longer matches this package size.";
    case "PACKAGE_NOT_FOUND":
      return "This package could not be found. Please restart the drop-off flow.";
    case "PACKAGE_ALREADY_RETRIEVED":
      return "This package was already retrieved and cannot be updated.";
    case "INVALID_REQUEST":
      return "The drop-off request was invalid. Please try again.";
    default:
      if (statusCode === 401) {
        return "Your session expired. Please sign in again.";
      }

      return (
        payload?.error?.message ??
        "Unable to complete the drop-off right now. Please try again."
      );
  }
}

function toAgentDropoffApiError(
  payload: AgentDropoffErrorResponse | null,
  statusCode: number,
) {
  return new AgentDropoffApiError(
    toAgentDropoffErrorMessage(payload, statusCode),
    {
      code: payload?.error?.code,
      statusCode,
    },
  );
}

export async function getAgentDropoffLockers(
  packageSize: PackageSize,
  token: string,
): Promise<AgentDropoffLockersResponse> {
  let response: Response;

  try {
    const params = new URLSearchParams({ packageSize });
    response = await fetch(
      `${getApiBaseUrl()}/agent/dropoff/lockers?${params.toString()}`,
      {
        headers: getAuthHeaders(token),
      },
    );
  } catch {
    throw new AgentDropoffApiError(
      "Unable to reach the server. Please try again.",
      {
        code: "NETWORK_ERROR",
        statusCode: 0,
      },
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | AgentDropoffLockersResponse
    | AgentDropoffErrorResponse
    | null;

  if (!response.ok) {
    throw toAgentDropoffApiError(
      payload as AgentDropoffErrorResponse | null,
      response.status,
    );
  }

  return payload as AgentDropoffLockersResponse;
}

export async function confirmAgentDropoff(
  input: ConfirmAgentDropoffInput,
  token: string,
): Promise<ConfirmAgentDropoffResponse> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}/agent/dropoff`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(input),
    });
  } catch {
    throw new AgentDropoffApiError(
      "Unable to reach the server. Please try again.",
      {
        code: "NETWORK_ERROR",
        statusCode: 0,
      },
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | ConfirmAgentDropoffResponse
    | AgentDropoffErrorResponse
    | null;

  if (!response.ok) {
    throw toAgentDropoffApiError(
      payload as AgentDropoffErrorResponse | null,
      response.status,
    );
  }

  return payload as ConfirmAgentDropoffResponse;
}

export async function updateAgentDropoffTime(
  input: UpdateAgentDropoffTimeInput,
  token: string,
): Promise<UpdateAgentDropoffTimeResponse> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}/agent/dropoff/dropped-off-at`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(input),
    });
  } catch {
    throw new AgentDropoffApiError(
      "Unable to reach the server. Please try again.",
      {
        code: "NETWORK_ERROR",
        statusCode: 0,
      },
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | UpdateAgentDropoffTimeResponse
    | AgentDropoffErrorResponse
    | null;

  if (!response.ok) {
    throw toAgentDropoffApiError(
      payload as AgentDropoffErrorResponse | null,
      response.status,
    );
  }

  return payload as UpdateAgentDropoffTimeResponse;
}
