import { MongoClient } from "@db/mongo";
import { UserSchema } from "./UserSchema.ts";
import { Chat } from "./Chat.ts";
import {
  MONGODB_CHATS_COLLECTION,
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE,
  MONGODB_USERS_COLLECTION,
} from "../config.ts";

const client = new MongoClient();
await client.connect(MONGODB_CONNECTION_URI);

const db = client.database(MONGODB_DATABASE);
const usersCollection = db.collection<UserSchema>(MONGODB_USERS_COLLECTION);
const chatsCollection = db.collection<Chat>(MONGODB_CHATS_COLLECTION);

export { chatsCollection, usersCollection };
