import { user as dbUser } from "../models/database.ts";
import { IUser } from "../models/schema.ts";
import { createHash } from "../test_deps.ts";
import { scrypt } from "../deps.ts";

let users: Array<IUser> = [];

const isTesting: boolean = Deno.env.get("TESTING") === "true" ? true : false;

const findOne = async (
  { uid }: { uid: string },
): Promise<IUser | undefined> => {
  if (isTesting) {
    return users.filter((u) => u.uid === uid)[0];
  }
  return await dbUser.findOne({ uid });
};

const insertOne = async (user: IUser): Promise<boolean | undefined> => {
  user.pass = await scrypt.hash(user.pass);
  if (isTesting) {
    users.push(user);
  } else {
    await dbUser.insertOne(user);
  }
  return true;
};

export const generateUserCredential = (): IUser => {
  const milliseconds = new Date().getMilliseconds().toString();
  return {
    uid: createHash("sha256").update(milliseconds).toString(),
    pass: createHash("sha512").update(milliseconds).toString(),
    pubKey: "foo",
    priKey: "bar",
  };
};

export const db = {
  user: {
    findOne,
    insertOne,
  },
};
