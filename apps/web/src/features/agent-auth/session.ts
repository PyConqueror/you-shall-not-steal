import type { Agent } from "../../types";

const AGENT_SESSION_KEY = "smart-locker-agent-session";
const SESSION_DURATION_MS = 15 * 60 * 1000;

export type AgentSession = {
  token: string;
  expiresAt: string;
  agent: Agent;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function buildMockToken(agentId: string, expiresAt: string) {
  const payload = `${agentId}:${new Date(expiresAt).getTime()}:${crypto.randomUUID()}`;
  return `mock.${btoa(payload).replace(/=/g, "")}`;
}

export function createAgentSession(agent: Agent) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  const session: AgentSession = {
    token: buildMockToken(agent.agentId, expiresAt),
    expiresAt,
    agent,
  };

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
