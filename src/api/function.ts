import {
  bcrypt as orgBcrypt,
  Context,
  create,
  getNumericDate,
  Status,
} from "../deps.ts";
import {
  INCORRECT_USERNAME_OR_PASSWORD,
  INVALID_DATA,
  UNKNOWN_ERROR,
  USER_ALREADY_EXISTS,
  USER_CREATED,
} from "../helpers/message_constants.ts";
import { responseErr, responseSuc } from "./response.ts";
import { isSHAhex, isStringEmpty } from "../helpers/string_validator.ts";
import { User as orgUser } from "../models/database.ts";
import { JWT_EXP_IN_MINUTES, JWT_SECRET } from "../config.ts";

export const newAsPost = async (ctx: Context) => {
  const { User, bcrypt } = Deno.env.get("TESTING")
    ? await import("./auth.test.ts")
    : { User: orgUser, bcrypt: orgBcrypt };

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

  if (await User.findOne({ uid }) !== undefined) {
    return responseErr(ctx, Status.Conflict, USER_ALREADY_EXISTS);
  }

  if (
    await User.insertOne({
      uid,
      pass: await bcrypt.hash(pass),
      pubKey,
      priKey,
    }) ===
      undefined
  ) {
    return responseErr(ctx, Status.ServiceUnavailable, UNKNOWN_ERROR);
  }
  responseSuc(ctx, Status.Created, { msg: USER_CREATED });
};

export const loginAsPost = async (ctx: Context) => {
  const { User, bcrypt, jwt } = Deno.env.get("TESTING")
    ? await import("./auth.test.ts")
    : { User: orgUser, bcrypt: orgBcrypt, jwt: { getNumericDate, create } };
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

  const user = await User.findOne({ uid });

  if (user === undefined) {
    return responseErr(ctx, Status.Forbidden, INCORRECT_USERNAME_OR_PASSWORD);
  }

  if (!(await bcrypt.compare(pass, user.pass))) {
    return responseErr(ctx, Status.Forbidden, INCORRECT_USERNAME_OR_PASSWORD);
  }

  // generate jwt
  const accessToken = await jwt.create({ alg: "HS512", typ: "JWT" }, {
    uid,
    exp: jwt.getNumericDate(parseInt(JWT_EXP_IN_MINUTES) * 60),
  }, JWT_SECRET);

  responseSuc(ctx, Status.OK, { accessToken });
};
