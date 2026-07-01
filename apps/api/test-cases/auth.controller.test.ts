import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { FastifyReply, FastifyRequest } from "fastify";

import { loginAgentController } from "../src/controllers/auth.controller";
import type { AgentLoginRequest } from "../src/schemas/auth";
import { activeAgent, inactiveAgent } from "./fixtures";
import { mockedAgentsCollection } from "./mock-type";
import {
  createMockReply,
  createMockRequest,
  expectAppError,
  setupModelMocks,
} from "./test-helpers";

describe("auth controller", () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    setupModelMocks();
    mockRequest = createMockRequest();
    mockReply = createMockReply();
  });

  describe("loginAgentController", () => {
    test("should return token, expiresAt, and agent on success", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(activeAgent),
      );
      mockRequest.body = { agentId: "agent-001" };

      await loginAgentController(
        mockRequest as FastifyRequest<{ Body: AgentLoginRequest }>,
        mockReply as FastifyReply,
      );

      expect(mockedAgentsCollection.findOne).toHaveBeenCalledWith({
        agentId: "agent-001",
      });
      expect(mockReply.jwtSign).toHaveBeenCalledWith(
        { sub: "agent-001", role: "agent" },
        { expiresIn: "15m" },
      );
      expect(mockReply.send).toHaveBeenCalledTimes(1);

      const response = (mockReply.send as ReturnType<typeof mock>).mock
        .calls[0][0];
      expect(response.token).toBe("mock-jwt-token");
      expect(response.expiresAt).toBeString();
      expect(response.agent).toEqual({
        agentId: "agent-001",
        name: "Test Agent",
        status: "active",
      });
    });

    test("should throw AGENT_NOT_FOUND when agent does not exist", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(null),
      );
      mockRequest.body = { agentId: "unknown-agent" };

      await expectAppError(
        loginAgentController(
          mockRequest as FastifyRequest<{ Body: AgentLoginRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "AGENT_NOT_FOUND",
          statusCode: 404,
          message: "Agent ID is invalid.",
        },
      );
    });

    test("should throw AGENT_INACTIVE when agent is not active", async () => {
      mockedAgentsCollection.findOne.mockImplementation(() =>
        Promise.resolve(inactiveAgent),
      );
      mockRequest.body = { agentId: "agent-inactive" };

      await expectAppError(
        loginAgentController(
          mockRequest as FastifyRequest<{ Body: AgentLoginRequest }>,
          mockReply as FastifyReply,
        ),
        {
          code: "AGENT_INACTIVE",
          statusCode: 403,
          message: "Agent account is inactive.",
        },
      );
    });
  });
});
