import { Context } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.9.3/mod.ts";
import { usersCollection } from "../models/db.ts";
import { UserSchema } from "../models/UserSchema.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.2.4/mod.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.2/mod.ts";
import { JWT_EXP_IN_MINUTES, JWT_SECRET } from "../config.ts";

/* exported function
- postCreateNewAccount
- getCreateNewAccount
- postLogin
- getLogin
*/

export const postCreateNewAccount = async (ctx: Context) => {
  const bodyValue = await ctx.request.body({ type: "form" }).value;
  const hashedUsername: string = bodyValue.get("hashed_username") || "";
  const authPassword: string = bodyValue.get("auth_password") || "";
  const publicKey: string = bodyValue.get("public_key") || "";
  const encryptedPrivateKey: string = bodyValue.get("encrypted_private_key") ||
    "";

  /* check if all data are valid */
  if (
    isEmpty(hashedUsername) || isEmpty(authPassword) || isEmpty(publicKey) ||
    isEmpty(encryptedPrivateKey) ||
    !isSHAhex({ s: hashedUsername, numBits: 256 }) ||
    !isSHAhex({ s: authPassword, numBits: 512 })
  ) {
    ctx.response.body = { message: "Invalid data." };
    return;
  }
  /* check if user already exists. */
  if (await usersCollection.findOne({ hashedUsername }) !== undefined) {
    ctx.response.body = { message: "User already exists." };
    return;
  }

  if (
    !await createUser({
      hashedUsername,
      authPassword,
      publicKey,
      encryptedPrivateKey,
    })
  ) {
    ctx.response.body = { message: "Something wrong." };
    return;
  }
  ctx.response.body = await renderFileToString(
    `${Deno.cwd()}/views/accounts/account_created.ejs`,
    {},
  );
};

export const getCreateNewAccount = async (ctx: Context) => {
  ctx.response.body = await renderFileToString(
    `${Deno.cwd()}/views/accounts/create_new_account.ejs`,
    {},
  );
};

export const getLogin = async (ctx: Context) => {
  ctx.response.body = await renderFileToString(
    `${Deno.cwd()}/views/accounts/login.ejs`,
    {},
  );
};

export const postLogin = async (ctx: Context) => {
  const bodyValue = await ctx.request.body({ type: "form" }).value;
  const hashedUsername: string = bodyValue.get("hashed_username") || "";
  const authPassword: string = bodyValue.get("auth_password") || "";

  /* make sure all data are valid */
  if (
    isEmpty(hashedUsername) || isEmpty(authPassword) ||
    !isSHAhex({ s: hashedUsername, numBits: 256 }) ||
    !isSHAhex({ s: authPassword, numBits: 512 })
  ) {
    ctx.response.body = { message: "Invalid data" };
    return;
  }

  const u = await usersCollection.findOne({ hashedUsername });
  if (u === undefined) {
    ctx.response.body = { message: "User does not exist." };
    return;
  }
  if (!await bcrypt.compare(authPassword, u.hashedPassword)) {
    ctx.response.body = { message: "Wrong username or password." };
    return;
  }

  const jwt = await create({ alg: "HS512", typ: "JWT" }, {
    usr: u.hashedUsername,
    exp: getNumericDate(parseInt(JWT_EXP_IN_MINUTES) * 60),
  }, JWT_SECRET);
  const now = new Date();
  now.setTime(now.getTime() + parseInt(JWT_EXP_IN_MINUTES) * 60 * 1000);
  const cookieExpireTime = now.toUTCString();
  ctx.response.headers.set(
    "Set-Cookie",
    `access_token=${jwt}; Expires=${cookieExpireTime}; HttpOnly`,
  );
  ctx.response.body = {
    message: "Login succeeded",
    access_token: jwt,
  };
};

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
