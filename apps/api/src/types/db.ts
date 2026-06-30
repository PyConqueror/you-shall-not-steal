import type { Db, MongoClient } from "mongodb";

export type MongoConnection = {
  client: MongoClient;
  db: Db;
  ping: () => Promise<void>;
  close: () => Promise<void>;
};
