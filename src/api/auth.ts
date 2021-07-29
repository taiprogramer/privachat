import { bcrypt as orgBcrypt, Context, Router, Status } from "../deps.ts";
import {
  INVALID_DATA,
  UNKNOWN_ERROR,
  USER_ALREADY_EXISTS,
  USER_CREATED,
} from "../helpers/message_constants.ts";
import { responseErr, responseSuc } from "./response.ts";
import { isSHAhex, isStringEmpty } from "../helpers/string_validator.ts";
import { Rhum } from "../test_deps.ts";
import { User as orgUser } from "../models/database.ts";

const authRouter = new Router();

authRouter.post("/new", async (ctx: Context) => {
  let bcrypt: any = orgBcrypt;
  let User: any = orgUser;
  // Rhum test stub BEGIN
  if (Deno.env.get("TESTING")) {
    bcrypt = Rhum.stubbed(Object.create(orgBcrypt));
    bcrypt.stub("hash", () => {
      return "$2a$10$HCGA1/d0m3s39hnMaZBZZOWYNiAMOsr70lf93rm6PMHFpnTCG6Wdi";
    });

    User = Rhum.stubbed(Object.create(orgUser));
    User.stub("findOne", () => {
      return undefined;
    });
    User.stub("insertOne", () => {
      return true;
    });
  }
  // Rhum test stub END
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
});

export { authRouter };
