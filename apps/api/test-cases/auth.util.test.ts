import { beforeEach, describe, expect, mock, test } from "bun:test";

import { resolveAuthenticatedAgent } from "../src/utils/auth.util";
import { activeAgent, mockDb } from "./fixtures";
import { mockedAgentsCollection, resetMockedCollections } from "./mock-type";
import { expectAppError } from "./test-helpers";

describe("auth util", () => {
  beforeEach(() => {
    resetMockedCollections();

    mock.module("../src/models/index.ts", () => ({
      getAgentsCollection: mock(() => mockedAgentsCollection),
    }));
  });

  describe("resolveAuthenticatedAgent", () => {
    test("returns the agent document when found", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );

      const agent = await resolveAuthenticatedAgent(mockDb, "agent-001");

      expect(agent).toBe(activeAgent);
      expect(mockedAgentsCollection.findOne).toHaveBeenCalledWith({
        agentId: "agent-001",
      });
    });

    test("throws AUTHENTICATED_AGENT_NOT_FOUND when agent is missing", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() => Promise.resolve(null));

      await expectAppError(resolveAuthenticatedAgent(mockDb, "missing-agent"), {
        code: "AUTHENTICATED_AGENT_NOT_FOUND",
        statusCode: 401,
        message: "Authenticated agent could not be resolved.",
      });
    });
  });
});
