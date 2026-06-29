import type { Db } from "mongodb";
import { createMockPackages, mockAgents, mockLockers } from "shared";
import {
  getAgentsCollection,
  getLockersCollection,
  getPackagesCollection,
} from "@/db/collections";

export async function seedDatabaseIfEmpty(db: Db): Promise<boolean> {
  const agentsCollection = getAgentsCollection(db);
  const lockersCollection = getLockersCollection(db);
  const packagesCollection = getPackagesCollection(db);

  const [agentCount, lockerCount, packageCount] = await Promise.all([
    agentsCollection.countDocuments({}),
    lockersCollection.countDocuments({}),
    packagesCollection.countDocuments({}),
  ]);

  if (agentCount > 0 || lockerCount > 0 || packageCount > 0) {
    console.info("Skipping mock data seed because the database already contains data.");
    return false;
  }

  await Promise.all([
    agentsCollection.insertMany(mockAgents),
    lockersCollection.insertMany(mockLockers),
    packagesCollection.insertMany(createMockPackages()),
  ]);

  console.info("Seeded mock data into the empty database.");
  return true;
}
