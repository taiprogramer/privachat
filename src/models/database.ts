import { MongoClient } from "../deps.ts";
import { IChat, IFriendship, IMessage, IUser } from "./schema.ts";
import { MONGODB_CONNECTION_URI, MONGODB_DATABASE } from "../config.ts";

const client = new MongoClient();
await client.connect(MONGODB_CONNECTION_URI);

const db = client.database(MONGODB_DATABASE);
const user = db.collection<IUser>("user");
const chat = db.collection<IChat>("chat");
const message = db.collection<IMessage>("message");
const friendship = db.collection<IFriendship>("friendship");

export { chat, friendship, message, user };
