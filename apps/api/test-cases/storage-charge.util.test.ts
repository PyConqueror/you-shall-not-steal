import { describe, expect, test } from "bun:test";

import {
  calculateChargeableDays,
  calculateStorageCharge,
  createStorageChargePreview,
} from "../src/utils/storage-charge.util";

describe("storage-charge util", () => {
  describe("calculateChargeableDays", () => {
    test("returns 0 for same-day retrieval", () => {
      expect(
        calculateChargeableDays("2026-01-01T10:00:00.000Z", "2026-01-01T20:00:00.000Z"),
      ).toBe(0);
    });

    test("returns 1 after a full 24-hour period", () => {
      expect(
        calculateChargeableDays("2026-01-01T00:00:00.000Z", "2026-01-02T00:00:00.000Z"),
      ).toBe(1);
    });

    test("floors partial days and never returns negative values", () => {
      expect(
        calculateChargeableDays("2026-01-02T00:00:00.000Z", "2026-01-01T00:00:00.000Z"),
      ).toBe(0);
      expect(
        calculateChargeableDays("2026-01-01T00:00:00.000Z", "2026-01-03T12:00:00.000Z"),
      ).toBe(2);
    });
  });

  describe("calculateStorageCharge", () => {
    test("charges nothing for same-day retrieval", () => {
      expect(
        calculateStorageCharge("2026-01-01T10:00:00.000Z", "2026-01-01T20:00:00.000Z"),
      ).toEqual({
        chargeableDays: 0,
        firstTierDays: 0,
        secondTierDays: 0,
        thirdTierDays: 0,
        firstTierAmount: 0,
        secondTierAmount: 0,
        thirdTierAmount: 0,
        totalAmount: 0,
      });
    });

    test("applies first tier rate for days 1 through 5", () => {
      expect(
        calculateStorageCharge("2026-01-01T00:00:00.000Z", "2026-01-06T00:00:00.000Z"),
      ).toEqual({
        chargeableDays: 5,
        firstTierDays: 5,
        secondTierDays: 0,
        thirdTierDays: 0,
        firstTierAmount: 10,
        secondTierAmount: 0,
        thirdTierAmount: 0,
        totalAmount: 10,
      });
    });

    test("applies doubled rate for days 6 through 10", () => {
      expect(
        calculateStorageCharge("2026-01-01T00:00:00.000Z", "2026-01-11T00:00:00.000Z"),
      ).toEqual({
        chargeableDays: 10,
        firstTierDays: 5,
        secondTierDays: 5,
        thirdTierDays: 0,
        firstTierAmount: 10,
        secondTierAmount: 20,
        thirdTierAmount: 0,
        totalAmount: 30,
      });
    });

    test("applies tripled rate beyond day 10", () => {
      expect(
        calculateStorageCharge("2026-01-01T00:00:00.000Z", "2026-01-16T00:00:00.000Z"),
      ).toEqual({
        chargeableDays: 15,
        firstTierDays: 5,
        secondTierDays: 5,
        thirdTierDays: 5,
        firstTierAmount: 10,
        secondTierAmount: 20,
        thirdTierAmount: 30,
        totalAmount: 60,
      });
    });
  });

  describe("createStorageChargePreview", () => {
    test("includes the provided retrieval timestamp in the preview", () => {
      const retrievedAt = "2026-01-06T00:00:00.000Z";

      expect(
        createStorageChargePreview("2026-01-01T00:00:00.000Z", retrievedAt),
      ).toEqual({
        retrievedAt,
        chargeableDays: 5,
        firstTierDays: 5,
        secondTierDays: 0,
        thirdTierDays: 0,
        firstTierAmount: 10,
        secondTierAmount: 0,
        thirdTierAmount: 0,
        totalAmount: 10,
      });
    });
  });
});
