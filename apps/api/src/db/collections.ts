import type { Collection, Db } from "mongodb";
import type { Agent, Locker, PackageRecord } from "../types/entities";

export function getAgentsCollection(db: Db): Collection<Agent> {
  return db.collection<Agent>("agents");
}

export function getLockersCollection(db: Db): Collection<Locker> {
  return db.collection<Locker>("lockers");
}

export function getPackagesCollection(db: Db): Collection<PackageRecord> {
  return db.collection<PackageRecord>("packages");
}

export async function ensureDatabaseIndexes(db: Db) {
  await Promise.all([
    getAgentsCollection(db).createIndex(
      { agentId: 1 },
      { unique: true, name: "agents_agentId_unique" },
    ),
    getLockersCollection(db).createIndex(
      { lockerId: 1 },
      { unique: true, name: "lockers_lockerId_unique" },
    ),
    getPackagesCollection(db).createIndex(
      { lockerId: 1, pickupCode: 1, status: 1 },
      { name: "packages_lookup_idx" },
    ),
    getPackagesCollection(db).createIndex(
      { pickupCode: 1 },
      { name: "packages_pickupCode_idx" },
    ),
    getPackagesCollection(db).createIndex(
      { status: 1 },
      { name: "packages_status_idx" },
    ),
  ]);
}
