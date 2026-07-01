import { expect, mock } from "bun:test";
import type { FastifyReply, FastifyRequest } from "fastify";

import { AppError } from "../src/errors/app-error";
import { defaultServerConfig, mockDb } from "./fixtures";
import {
  mockedAgentsCollection,
  mockedLockersCollection,
  mockedPackagesCollection,
  resetMockedCollections,
} from "./mock-type";

type MockRequestOverrides = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
  user?: { sub: string; role?: string };
  config?: Partial<typeof defaultServerConfig>;
};

export function createMockReply(): Partial<FastifyReply> {
  const mockReply = {
    code: mock(() => mockReply),
    send: mock(() => mockReply),
    status: mock(() => mockReply),
    jwtSign: mock(() => Promise.resolve("mock-jwt-token")),
  } as Partial<FastifyReply>;

  return mockReply;
}

export function createMockRequest(
  overrides: MockRequestOverrides = {},
): Partial<FastifyRequest> {
  return {
    body: overrides.body ?? {},
    query: overrides.query ?? {},
    params: overrides.params ?? {},
    user: overrides.user ?? { sub: "agent-001", role: "agent" },
    log: { error: mock(() => {}), warn: mock(() => {}) },
    server: {
      mongo: { db: mockDb },
      config: { ...defaultServerConfig, ...overrides.config },
    },
  } as unknown as Partial<FastifyRequest>;
}

export async function expectAppError(
  promise: Promise<unknown>,
  expected: { code: string; statusCode: number; message?: string },
): Promise<void> {
  try {
    await promise;
    throw new Error("Expected AppError to be thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    const appError = error as AppError;
    expect(appError.code).toBe(expected.code);
    expect(appError.statusCode).toBe(expected.statusCode);

    if (expected.message !== undefined) {
      expect(appError.message).toBe(expected.message);
    }
  }
}

export function setupModelMocks(): void {
  resetMockedCollections();

  mock.module("../src/models/index.ts", () => ({
    getAgentsCollection: mock(() => mockedAgentsCollection),
    getLockersCollection: mock(() => mockedLockersCollection),
    getPackagesCollection: mock(() => mockedPackagesCollection),
    ensureDatabaseIndexes: mock(() => Promise.resolve()),
  }));
}
