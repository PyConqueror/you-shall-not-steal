import type { Agent } from "@/types";

const AGENT_SESSION_KEY = "smart-locker-agent-session";

export type AgentSession = {
  token: string;
  expiresAt: string;
  agent: Agent;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function createAgentSession(session: AgentSession) {
  if (isBrowser()) {
    window.sessionStorage.setItem(AGENT_SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

export function getAgentSession() {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(AGENT_SESSION_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as AgentSession;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      clearAgentSession();
      return null;
    }

    return parsed;
  } catch {
    clearAgentSession();
    return null;
  }
}

export function hasValidAgentSession() {
  return getAgentSession() !== null;
}

export function clearAgentSession() {
  if (isBrowser()) {
    window.sessionStorage.removeItem(AGENT_SESSION_KEY);
  }
}
