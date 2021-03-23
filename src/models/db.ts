import { MongoClient } from "https://deno.land/x/mongo@v0.22.0/mod.ts";
import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
import { UserSchema } from "./UserSchema.ts";

const env = config({ safe: true });

const client = new MongoClient();
await client.connect(env.MONGODB_CONNECTION_URI);

const db = client.database(env.MONGODB_DATABASE);
const usersCollection = db.collection<UserSchema>(env.MONGODB_USERS_COLLECTION);

export { usersCollection };
