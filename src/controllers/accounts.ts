import { Context } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.9.3/mod.ts";
import { usersCollection } from "../models/db.ts";
import { UserSchema } from "../models/UserSchema.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.2.4/mod.ts";
import {
  create,
  getNumericDate,
  verify,
} from "https://deno.land/x/djwt@v2.2/mod.ts";
import { JWT_EXP_IN_MINUTES, JWT_SECRET } from "../config.ts";
import { isSHAhex, isStringEmpty } from "../helpers/string_validator.ts";
import {
  ERROR,
  INCORRECT_USERNAME_OR_PASSWORD,
  INVALID_DATA,
  SUCCESS,
  UNKNOWN_ERROR,
  USER_ALREADY_EXISTS,
  USER_CREATED,
  USER_NOT_FOUND,
} from "../helpers/message_constants.ts";

import { responseErr } from "../helpers/response.ts";

export {
  checkAuth,
  getCreateNewAccount,
  getLogin,
  getLogout,
  postCreateNewAccount,
  postLogin,
  toHomeIfLoggedIn,
};

const postCreateNewAccount = async (ctx: Context) => {
  const bodyValue = await ctx.request.body({ type: "form" }).value;
  const hashedUsername: string = bodyValue.get("hashed_username") || "";
  const authPassword: string = bodyValue.get("auth_password") || "";
  const publicKey: string = bodyValue.get("public_key") || "";
  const encryptedPrivateKey: string = bodyValue.get("encrypted_private_key") ||
    "";

  /* check if all data are valid */
  if (
    isStringEmpty(hashedUsername) || isStringEmpty(authPassword) ||
    isStringEmpty(publicKey) ||
    isStringEmpty(encryptedPrivateKey) ||
    !isSHAhex({ s: hashedUsername, numBits: 256 }) ||
    !isSHAhex({ s: authPassword, numBits: 512 })
  ) {
    return responseErr(ctx, INVALID_DATA);
  }

  /* check if user already exists. */
  if (await usersCollection.findOne({ hashedUsername }) !== undefined) {
    return responseErr(ctx, USER_ALREADY_EXISTS);
  }

  if (
    !await createUser({
      hashedUsername,
      authPassword,
      publicKey,
      encryptedPrivateKey,
    })
  ) {
    return responseErr(ctx, UNKNOWN_ERROR);
  }
  ctx.response.body = JSON.stringify({ msg: USER_CREATED, msg_type: SUCCESS });
};

const getCreateNewAccount = async (ctx: Context) => {
  ctx.response.body = await renderFileToString(
    `${Deno.cwd()}/views/accounts/create_new_account.ejs`,
    {},
  );
};

const getLogin = async (ctx: Context) => {
  ctx.response.body = await renderFileToString(
    `${Deno.cwd()}/views/accounts/login.ejs`,
    {},
  );
};

const postLogin = async (ctx: Context) => {
  const bodyValue = await ctx.request.body({ type: "form" }).value;
  const hashedUsername: string = bodyValue.get("hashed_username") || "";
  const authPassword: string = bodyValue.get("auth_password") || "";

  /* make sure all data are valid */
  if (
    isStringEmpty(hashedUsername) || isStringEmpty(authPassword) ||
    !isSHAhex({ s: hashedUsername, numBits: 256 }) ||
    !isSHAhex({ s: authPassword, numBits: 512 })
  ) {
    return responseErr(ctx, INVALID_DATA);
  }

  const u = await usersCollection.findOne({ hashedUsername });
  if (u === undefined) {
    return responseErr(ctx, USER_NOT_FOUND);
  }

  if (!await bcrypt.compare(authPassword, u.hashedPassword)) {
    return responseErr(ctx, INCORRECT_USERNAME_OR_PASSWORD);
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
  ctx.response.redirect("/");
};

const getLogout = async (ctx: Context) => {
  ctx.cookies.set("access_token", "");
  ctx.response.body = await renderFileToString(
    `${Deno.cwd()}/views/accounts/logout.ejs`,
    {},
  );
};

const toHomeIfLoggedIn = async (
  ctx: Context,
  next: any,
) => {
  const accessToken = ctx.cookies.get("access_token");
  if (accessToken === undefined) {
    return await next();
  }

  try {
    await verify(accessToken, JWT_SECRET, "HS512");
    ctx.response.redirect("/");
  } catch {
    await next();
  }
};

const checkAuth = async (ctx: Context, next: any) => {
  const accessToken = ctx.cookies.get("access_token") ||
    "random_string_represent_wrong_token";

  try {
    ctx.state.payload = await verify(accessToken, JWT_SECRET, "HS512");
    await next();
  } catch {
    return ctx.response.redirect("/login");
  }
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
