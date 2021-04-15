import { Context } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { usersCollection } from "../models/db.ts";
import { responseErr } from "../helpers/response.ts";
import {
  INVALID_DATA,
  SUCCESS,
  USER_NOT_FOUND,
} from "../helpers/message_constants.ts";
import { isSHAhex, isStringEmpty } from "../helpers/string_validator.ts";

export { postGetEncryptedPrivateKey, postGetPublicKey };

const postGetEncryptedPrivateKey = async (ctx: Context) => {
  const uid = ctx.state.payload.usr;
  const user = await usersCollection.findOne({
    hashedUsername: uid,
  });

  if (!user) {
    return responseErr(ctx, USER_NOT_FOUND);
  }

  ctx.response.body = JSON.stringify({
    msg_type: SUCCESS,
    msg: {
      encrypted_private_key: user.encryptedPrivateKey,
    },
  });
};

const postGetPublicKey = async (ctx: Context) => {
  const bodyValue = await ctx.request.body({ type: "form" }).value;
  const uid = bodyValue.get("uid") || "";

  if (isStringEmpty(uid) || !isSHAhex({ s: uid, numBits: 256 })) {
    return responseErr(ctx, INVALID_DATA);
  }

  const user = await usersCollection.findOne({
    hashedUsername: uid,
  });

  if (!user) {
    return responseErr(ctx, USER_NOT_FOUND);
  }

  ctx.response.body = JSON.stringify({
    msg_type: SUCCESS,
    msg: {
      public_key: user.publicKey,
    },
  });
};
