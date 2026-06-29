import { MongoClient, ServerApiVersion, type Db } from "mongodb";
import type { Env } from "@/config";
import { ensureDatabaseIndexes } from "./collections";

export type MongoConnection = {
  client: MongoClient;
  db: Db;
  ping: () => Promise<void>;
  close: () => Promise<void>;
};

export async function createMongoConnection(
  config: Env,
): Promise<MongoConnection> {
  const client = new MongoClient(config.MONGODB_URI, {
    serverApi: ServerApiVersion.v1,
    serverSelectionTimeoutMS: config.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
  });

  try {
    await client.connect();

    const db = client.db(config.MONGODB_DB_NAME);
    await ensureDatabaseIndexes(db);

    return {
      client,
      db,
      ping: async () => {
        await db.command({ ping: 1 });
      },
      close: async () => {
        await client.close();
      },
    };
  } catch (error) {
    await client.close().catch(() => undefined);
    throw new Error("Failed to connect to MongoDB.", { cause: error });
  }
}
