import { Context } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.9.3/mod.ts";
import { usersCollection } from "../models/db.ts";
import { UserSchema } from "../models/UserSchema.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.2.4/mod.ts";

export const postCreateNewAccount = async (ctx: Context) => {
  const bodyValue = await ctx.request.body({ type: "form" }).value;
  const hashedUsername: string = bodyValue.get("hashed_username") || "";
  const authPassword: string = bodyValue.get("auth_password") || "";
  const publicKey: string = bodyValue.get("public_key") || "";
  const encryptedPrivateKey: string = bodyValue.get("encrypted_private_key") ||
    "";

  /* check if all data are valid */
  if (
    !validData({ hashedUsername, authPassword, publicKey, encryptedPrivateKey })
  ) {
    ctx.response.body = { message: "Invalid data." };
    return;
  }
  /* check if user already exists. */
  if (await isUserExist(hashedUsername)) {
    ctx.response.body = { message: "User already exists." };
    return;
  }

  if (
    await createUser({
      hashedUsername,
      authPassword,
      publicKey,
      encryptedPrivateKey,
    })
  ) {
    ctx.response.body = { message: "User has been created." };
    return;
  }

  ctx.response.body = { message: "Something wrong." };
};

export const getCreateNewAccount = async (ctx: Context) => {
  ctx.response.body = await renderFileToString(
    `${Deno.cwd()}/views/accounts/create_new_account.ejs`,
    {},
  );
};

function validData(
  { hashedUsername, authPassword, publicKey, encryptedPrivateKey }: {
    hashedUsername: string;
    authPassword: string;
    publicKey: string;
    encryptedPrivateKey: string;
  },
): boolean {
  let valid = true;
  valid = valid &&
    !(isEmpty(hashedUsername) || isEmpty(authPassword) || isEmpty(publicKey) ||
      isEmpty(encryptedPrivateKey));
  valid = valid && isSHAhex({ s: hashedUsername, numBits: 256 });
  valid = valid && isSHAhex({ s: authPassword, numBits: 512 });
  return valid;
}

async function isUserExist(hashedUsername: string): Promise<boolean> {
  const u = await usersCollection.findOne({ hashedUsername });
  return u !== undefined;
}

async function createUser(
  { hashedUsername, authPassword, publicKey, encryptedPrivateKey }: {
    hashedUsername: string;
    authPassword: string;
    publicKey: string;
    encryptedPrivateKey: string;
  },
): Promise<boolean> {
  const u: UserSchema = {
    hashedUsername,
    hashedPassword: await bcrypt.hash(authPassword),
    publicKey,
    encryptedPrivateKey,
  };
  const insertedId = await usersCollection.insertOne(u);
  return insertedId !== undefined;
}

function isEmpty(s: string): boolean {
  return s === "";
}

function isSHAhex({ s, numBits }: { s: string; numBits: number }): boolean {
  let regex = new RegExp(`[0-9A-Fa-f]{${numBits / 4}}`);
  return s.length === (numBits / 4) && regex.test(s);
}
