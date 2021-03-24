import { MongoClient } from "https://deno.land/x/mongo@v0.22.0/mod.ts";
import { UserSchema } from "./UserSchema.ts";
import {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE,
  MONGODB_USERS_COLLECTION,
} from "../config.ts";

const client = new MongoClient();
await client.connect(MONGODB_CONNECTION_URI);

const db = client.database(MONGODB_DATABASE);
const usersCollection = db.collection<UserSchema>(MONGODB_USERS_COLLECTION);

export { usersCollection };
