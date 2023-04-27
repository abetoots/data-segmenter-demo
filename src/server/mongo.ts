import { MongoClient } from "mongodb";
import { env } from "~/env.mjs";
import type { Collection } from "mongodb";
import type { AccountEvent, AccountProfileList } from "./types/account";
import type { AccountSegment } from "./types/segments";

export type AppDb = {
  profiles: Collection<AccountProfileList>;
  events: Collection<AccountEvent>;
  segments: Collection<AccountSegment>;
};

let db: AppDb;

export async function getDb() {
  if (db) return db;

  const client = new MongoClient(env.MONGODB_URL);
  await client.connect();
  //FOR DEMO PURPOSES
  const accountDb = client.db(`account_${env.ACCOUNT_ID}`);
  db = {
    profiles: accountDb.collection("profiles"),
    events: accountDb.collection("events"),
    segments: accountDb.collection("segments"),
  };
  return db;
}
