import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";

const env = config({ safe: true });
const PORT = env.PORT;
const MONGODB_CONNECTION_URI = env.MONGODB_CONNECTION_URI;
const MONGODB_DATABASE = env.MONGODB_DATABASE;
const MONGODB_USERS_COLLECTION = env.MONGODB_USERS_COLLECTION;
const JWT_SECRET = env.JWT_SECRET;
const JWT_EXP_IN_MINUTES = env.JWT_EXP_IN_MINUTES;

export {
  JWT_EXP_IN_MINUTES,
  JWT_SECRET,
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE,
  MONGODB_USERS_COLLECTION,
  PORT,
};
