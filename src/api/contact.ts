import { Router } from "../deps.ts";

const contactRouter = new Router();

contactRouter.post("/add", addAsPost);
contactRouter.post("/list", listAsGet);
contactRouter.post("/delete", deleteAsPost);
contactRouter.post("/edit", editAsPost);

export { contactRouter };

import { Context, Status } from "../deps.ts";
import { responseErr, responseSuc } from "./response.ts";
import {
  INVALID_DATA,
  UNKNOWN_ERROR,
  YOU_ALREADY_KNOW_YOU,
} from "../helpers/message_constants.ts";
import { isSHAhex, isStringEmpty } from "../helpers/string_validator.ts";
import { IFriendship } from "../models/schema.ts";
import { db } from "./datastore.ts";

async function addAsPost(ctx: Context) {
  const body = await ctx.request.body();

  if (body.type !== "json") {
    return responseErr(ctx, Status.BadRequest, INVALID_DATA);
  }

  const friendship: IFriendship = await body.value;

  if (
    !isSHAhex({ s: friendship.uid, numBits: 256 }) ||
    !isSHAhex({ s: friendship.friendId, numBits: 256 }) ||
    isStringEmpty(friendship.nickname)
  ) {
    return responseErr(ctx, Status.BadRequest, INVALID_DATA);
  }

  if (friendship.uid === friendship.friendId) {
    return responseErr(ctx, Status.BadRequest, YOU_ALREADY_KNOW_YOU);
  }

  if (await db.friendship.insertOne(friendship) === undefined) {
    return responseErr(ctx, Status.ServiceUnavailable, UNKNOWN_ERROR);
  }
  responseSuc(ctx, Status.Created, {});
}

async function listAsGet(ctx: Context) {
}

async function deleteAsPost(ctx: Context) {
}
async function editAsPost(ctx: Context) {
}
