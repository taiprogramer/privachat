import { Router } from "../deps.ts";

const authRouter = new Router();

authRouter.post("/new", newAsPost);
authRouter.post("/login", loginAsPost);

export { authRouter };

import { Context, create, getNumericDate, scrypt, Status } from "../deps.ts";
import {
  INCORRECT_USERNAME_OR_PASSWORD,
  INVALID_DATA,
  UNKNOWN_ERROR,
  USER_ALREADY_EXISTS,
  USER_CREATED,
} from "../helpers/message_constants.ts";
import { responseErr, responseSuc } from "./response.ts";
import { isSHAhex, isStringEmpty } from "../helpers/string_validator.ts";
import { db } from "./datastore.ts";
import { JWT_EXP_IN_MINUTES, JWT_SECRET } from "../config.ts";

async function newAsPost(ctx: Context) {
  const body = await ctx.request.body();

  if (body.type !== "json") {
    return responseErr(ctx, Status.BadRequest, INVALID_DATA);
  }

  const { uid, pass, pubKey, priKey } = await body.value;

  if (
    !isSHAhex({ s: uid, numBits: 256 }) ||
    !isSHAhex({ s: pass, numBits: 512 }) || isStringEmpty(pubKey) ||
    isStringEmpty(priKey)
  ) {
    return responseErr(ctx, Status.BadRequest, INVALID_DATA);
  }

  if (await db.user.findOne({ uid }) !== undefined) {
    return responseErr(ctx, Status.Conflict, USER_ALREADY_EXISTS);
  }

  const user = { uid, pass, pubKey, priKey };

  if (await db.user.insertOne(user) === undefined) {
    return responseErr(ctx, Status.ServiceUnavailable, UNKNOWN_ERROR);
  }
  responseSuc(ctx, Status.Created, { msg: USER_CREATED });
}

async function loginAsPost(ctx: Context) {
  const body = await ctx.request.body();

  if (body.type !== "json") {
    return responseErr(ctx, Status.BadRequest, INVALID_DATA);
  }

  const { uid, pass } = await body.value;

  if (
    !isSHAhex({ s: uid, numBits: 256 }) || !isSHAhex({ s: pass, numBits: 512 })
  ) {
    return responseErr(ctx, Status.BadRequest, INVALID_DATA);
  }

  const user = await db.user.findOne({ uid });

  if (user === undefined) {
    return responseErr(ctx, Status.Forbidden, INCORRECT_USERNAME_OR_PASSWORD);
  }

  if (!(await scrypt.verify(pass, user.pass))) {
    return responseErr(ctx, Status.Forbidden, INCORRECT_USERNAME_OR_PASSWORD);
  }

  // generate jwt
  const accessToken = await create({ alg: "HS512", typ: "JWT" }, {
    uid,
    exp: getNumericDate(parseInt(JWT_EXP_IN_MINUTES) * 60),
  }, JWT_SECRET);

  responseSuc(ctx, Status.OK, { accessToken });
}
