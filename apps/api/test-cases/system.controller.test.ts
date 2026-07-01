const mockPingDatabase = mock(() => Promise.resolve());

import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { FastifyReply, FastifyRequest } from "fastify";

import {
  getHealthController,
  getReadyController,
} from "../src/controllers/system.controller";
import { createMockReply } from "./test-helpers";

describe("system controller", () => {
  let mockReply: Partial<FastifyReply>;

  beforeEach(() => {
    mockPingDatabase.mockReset();
    mockPingDatabase.mockImplementation(() => Promise.resolve());

    mock.module("../src/config/index.ts", () => ({
      pingDatabase: mockPingDatabase,
      connectToDatabase: mock(() => Promise.resolve()),
      disconnectFromDatabase: mock(() => Promise.resolve()),
      getDatabaseConnection: mock(() => ({})),
      loadEnv: mock(() => Promise.resolve({})),
    }));

    mockReply = createMockReply();
  });

  describe("getHealthController", () => {
    test("should return ok status with timestamp", async () => {
      await getHealthController(
        {} as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.send).toHaveBeenCalledTimes(1);
      const response = (mockReply.send as ReturnType<typeof mock>).mock
        .calls[0][0];
      expect(response.status).toBe("ok");
      expect(response.timestamp).toBeString();
      expect(new Date(response.timestamp).toISOString()).toBe(
        response.timestamp,
      );
    });
  });

  describe("getReadyController", () => {
    test("should return ready status when database ping succeeds", async () => {
      await getReadyController(
        {} as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockPingDatabase).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledTimes(1);
      const response = (mockReply.send as ReturnType<typeof mock>).mock
        .calls[0][0];
      expect(response.status).toBe("ready");
      expect(response.timestamp).toBeString();
    });

    test("should throw DATABASE_UNAVAILABLE when database ping fails", async () => {
      mockPingDatabase.mockImplementation(() =>
        Promise.reject(new Error("DB unavailable")),
      );

      await expect(
        getReadyController({} as FastifyRequest, mockReply as FastifyReply),
      ).rejects.toMatchObject({
        code: "DATABASE_UNAVAILABLE",
        statusCode: 503,
        message: "Database readiness check failed.",
      });
    });
  });
});
