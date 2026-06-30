import { createMongoConnection } from "@/db/client";
import type { MongoConnection } from "@/types/db";
import type { Env } from "./env.config";

let mongoConnection: MongoConnection | null = null;

export async function connectToDatabase(config: Env): Promise<MongoConnection> {
  if (mongoConnection) {
    return mongoConnection;
  }

  mongoConnection = await createMongoConnection(config);
  return mongoConnection;
}

export async function disconnectFromDatabase() {
  if (!mongoConnection) {
    return;
  }

  const activeConnection = mongoConnection;
  mongoConnection = null;
  await activeConnection.close();
}

export function getDatabaseConnection(): MongoConnection {
  if (!mongoConnection) {
    throw new Error("Database connection has not been initialized.");
  }

  return mongoConnection;
}

export async function pingDatabase() {
  await getDatabaseConnection().ping();
}
