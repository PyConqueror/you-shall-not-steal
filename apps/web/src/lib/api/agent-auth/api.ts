import type { AgentSession } from "@/types";
import { mapAgentAuthError } from "@/lib/api/agent-auth/messages";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { requestJson } from "@/lib/api/client";

export async function loginAgent(agentId: string): Promise<AgentSession> {
  return requestJson<AgentSession>(
    `${getApiBaseUrl()}/auth/agent/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agentId }),
    },
    mapAgentAuthError,
  );
}
