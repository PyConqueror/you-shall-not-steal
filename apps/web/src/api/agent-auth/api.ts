import type { AgentSession } from "./session";
import { getApiBaseUrl } from "../base-url";

type AgentLoginErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

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
