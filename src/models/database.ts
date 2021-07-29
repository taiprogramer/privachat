import { MongoClient } from "../deps.ts";
import {
  ChatSchema,
  FriendshipSchema,
  MessageSchema,
  UserSchema,
} from "./schema.ts";
import { MONGODB_CONNECTION_URI, MONGODB_DATABASE } from "../config.ts";

const client = new MongoClient();
await client.connect(MONGODB_CONNECTION_URI);

const db = client.database(MONGODB_DATABASE);
const User = db.collection<UserSchema>("user");
const Chat = db.collection<ChatSchema>("chat");
const Message = db.collection<MessageSchema>("message");
const Friendship = db.collection<FriendshipSchema>("friendship");

export { Chat, Friendship, Message, User };
