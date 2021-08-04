import {
  friendship as dbFriendship,
  user as dbUser,
} from "../models/database.ts";
import { IFriendship, IUser } from "../models/schema.ts";
import { createHash } from "../test_deps.ts";
import { scrypt } from "../deps.ts";

let users: Array<IUser> = [];
let friendships: Array<IFriendship> = [];

const isTesting: boolean = Deno.env.get("TESTING") === "true" ? true : false;

const user = {
  findOne: async (
    { uid }: { uid: string },
  ): Promise<IUser | undefined> => {
    if (isTesting) {
      return users.filter((u) => u.uid === uid)[0];
    }
    return await dbUser.findOne({ uid });
  },

  insertOne: async (u: IUser): Promise<any | undefined> => {
    u.pass = await scrypt.hash(u.pass);
    if (isTesting) {
      return users.push(u);
    }
    return await dbUser.insertOne(u);
  },
};

const friendship = {
  insertOne: async (fs: IFriendship): Promise<any | undefined> => {
    if (isTesting) {
      return friendships.push(fs);
    }
    return await dbFriendship.insertOne(fs);
  },
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

export const db = { user, friendship };
