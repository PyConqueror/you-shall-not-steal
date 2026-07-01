import type { Locker, PackageRecord, PackageSize } from "@/types";
import { mapAgentDropoffError } from "@/lib/api/agent-dropoff/messages";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { requestJson } from "@/lib/api/client";

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

export type SendEmailInput = {
  packageId: string;
  customerEmail: string;
};

export type SendEmailResponse = {
  package: PackageRecord;
};

export type UpdateAgentDropoffTimeInput = {
  packageId: string;
  droppedOffAt: string;
};

export type UpdateAgentDropoffTimeResponse = {
  package: PackageRecord;
};

function getAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getAgentDropoffLockers(
  packageSize: PackageSize,
  token: string,
): Promise<AgentDropoffLockersResponse> {
  const params = new URLSearchParams({ packageSize });

  return requestJson<AgentDropoffLockersResponse>(
    `${getApiBaseUrl()}/agent/dropoff/lockers?${params.toString()}`,
    {
      headers: getAuthHeaders(token),
    },
    mapAgentDropoffError,
  );
}

export async function confirmAgentDropoff(
  input: ConfirmAgentDropoffInput,
  token: string,
): Promise<ConfirmAgentDropoffResponse> {
  return requestJson<ConfirmAgentDropoffResponse>(
    `${getApiBaseUrl()}/agent/dropoff`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(input),
    },
    mapAgentDropoffError,
  );
}

export async function sendEmail(
  input: SendEmailInput,
  token: string,
): Promise<SendEmailResponse> {
  return requestJson<SendEmailResponse>(
    `${getApiBaseUrl()}/agent/dropoff/email`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(input),
    },
    mapAgentDropoffError,
  );
}

export async function updateAgentDropoffTime(
  input: UpdateAgentDropoffTimeInput,
  token: string,
): Promise<UpdateAgentDropoffTimeResponse> {
  return requestJson<UpdateAgentDropoffTimeResponse>(
    `${getApiBaseUrl()}/agent/dropoff/dropped-off-at`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(input),
    },
    mapAgentDropoffError,
  );
}
