import { beforeEach, describe, expect, test } from "bun:test";

import { AppError } from "../src/errors/app-error";
import { generateUniquePickupCode } from "../src/utils/pickup-code.util";
import { PACKAGE_STATUS } from "../src/types/enum";
import { mockDb } from "./fixtures";
import { mockedPackagesCollection } from "./mock-type";
import { expectAppError, setupModelMocks } from "./test-helpers";

describe("pickup-code util", () => {
  beforeEach(() => {
    setupModelMocks();
  });

  test("returns a six-digit code when no active package uses it", async () => {
    mockedPackagesCollection.findOne.mockImplementation(() => Promise.resolve(null));

    const pickupCode = await generateUniquePickupCode(mockDb);

    expect(pickupCode).toMatch(/^\d{6}$/);
    expect(mockedPackagesCollection.findOne).toHaveBeenCalledWith({
      pickupCode,
      status: PACKAGE_STATUS.STORED,
    });
  });

  test("retries generation when the first code collides", async () => {
    const attemptedCodes: string[] = [];
    mockedPackagesCollection.findOne.mockImplementation(({ pickupCode }) => {
      attemptedCodes.push(pickupCode);

      if (attemptedCodes.length === 1) {
        return Promise.resolve({ pickupCode });
      }

      return Promise.resolve(null);
    });

    const pickupCode = await generateUniquePickupCode(mockDb);

    expect(attemptedCodes).toHaveLength(2);
    expect(pickupCode).toBe(attemptedCodes[1]);
    expect(mockedPackagesCollection.findOne).toHaveBeenCalledTimes(2);
  });

  test("throws PICKUP_CODE_GENERATION_FAILED after exhausting retries", async () => {
    mockedPackagesCollection.findOne.mockImplementation(({ pickupCode }) =>
      Promise.resolve({ pickupCode }),
    );

    await expectAppError(generateUniquePickupCode(mockDb), {
      code: "PICKUP_CODE_GENERATION_FAILED",
      statusCode: 500,
      message: "Unable to generate a unique pickup code right now.",
    });
    expect(mockedPackagesCollection.findOne).toHaveBeenCalledTimes(10);
  });

  test("rejects with AppError when generation cannot succeed", async () => {
    mockedPackagesCollection.findOne.mockImplementation(({ pickupCode }) =>
      Promise.resolve({ pickupCode }),
    );

    await expect(
      generateUniquePickupCode(mockDb),
    ).rejects.toBeInstanceOf(AppError);
  });
});
