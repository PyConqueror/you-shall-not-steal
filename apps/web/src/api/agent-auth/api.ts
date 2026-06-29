import type { AgentSession } from "./session";

type AgentLoginErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

const DEFAULT_API_BASE_URL = "http://localhost:3001";

function getApiBaseUrl() {
  const env = import.meta.env as Record<string, string | undefined>;
  return (env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

function toAgentLoginErrorMessage(payload: AgentLoginErrorResponse | null) {
  switch (payload?.error?.code) {
    case "AGENT_NOT_FOUND":
      return "Invalid Agent ID. Please check your ID and try again.";
    case "AGENT_INACTIVE":
      return "This agent account is inactive.";
    case "INVALID_REQUEST":
      return "Please enter an Agent ID.";
    default:
      return payload?.error?.message ?? "Unable to log in right now. Please try again.";
  }
}

export async function loginAgent(agentId: string): Promise<AgentSession> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}/auth/agent/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agentId }),
    });
  } catch {
    throw new Error("Unable to reach the server. Please try again.");
  }

  const payload = (await response.json().catch(() => null)) as
    | AgentSession
    | AgentLoginErrorResponse
    | null;

  if (!response.ok) {
    throw new Error(
      toAgentLoginErrorMessage(payload as AgentLoginErrorResponse | null),
    );
  }

  return payload as AgentSession;
}
