import { randomInt } from "node:crypto";
import type { Db } from "mongodb";
import { AppError } from "@/errors/app-error";
import { getPackagesCollection } from "@/models";
import { PACKAGE_STATUS } from "@/types/enum";

const PICKUP_CODE_LENGTH = 6;
const PICKUP_CODE_LIMIT = 10 ** PICKUP_CODE_LENGTH;
const MAX_GENERATION_ATTEMPTS = 10;

function formatPickupCode(code: number): string {
  return code.toString().padStart(PICKUP_CODE_LENGTH, "0");
}

export async function generateUniquePickupCode(db: Db): Promise<string> {
  const packagesCollection = getPackagesCollection(db);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const pickupCode = formatPickupCode(randomInt(0, PICKUP_CODE_LIMIT));
    const existingPackage = await packagesCollection.findOne({
      pickupCode,
      status: PACKAGE_STATUS.STORED,
    });

    if (!existingPackage) {
      return pickupCode;
    }
  }

  throw new AppError({
    code: "PICKUP_CODE_GENERATION_FAILED",
    message: "Unable to generate a unique pickup code right now.",
    statusCode: 500,
  });
}
