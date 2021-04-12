import { Context } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { isSHAhex, isStringEmpty } from "../helpers/string_validator.ts";
import {
  ERROR,
  INVALID_DATA,
  NOT_HAVE_A_CHAT,
  SUCCESS,
  USER_NOT_FOUND,
  USER_NOT_IN_CONTACT,
} from "../helpers/message_constants.ts";
import { usersCollection } from "../models/db.ts";
import { ContactType } from "../models/UserSchema.ts";

export { postGetSingleChat };

/* Get a chat with a friend (user who is in contact list).
 * Return chat_id to client.
 * If no chat found or something else
 * signaling situation. */
const postGetSingleChat = async (ctx: Context) => {
  const uid = ctx.state.payload.usr;
  const bodyValue = await ctx.request.body({ type: "form" }).value;
  const friendId = bodyValue.get("friendId") || "";
  /* validate data */
  if (isStringEmpty(friendId) || !isSHAhex({ s: friendId, numBits: 256 })) {
    ctx.response.body = JSON.stringify({
      msg_type: ERROR,
      msg: INVALID_DATA,
    });
    return;
  }

  const u = await usersCollection.findOne({ hashedUsername: uid });
  if (u === undefined) {
    ctx.response.body = JSON.stringify({
      msg_type: ERROR,
      msg: USER_NOT_FOUND,
    });
    return;
  }

  /* check if friendId in contactList */
  const contactList: ContactType[] = u.contactList || [];
  const contactUser = contactList.find((c: ContactType) =>
    c.hashedUsername === friendId
  );

  if (contactUser === undefined) {
    ctx.response.body = JSON.stringify({
      msg_type: ERROR,
      msg: USER_NOT_IN_CONTACT,
    });
    return;
  }

  /* check if friendId have a chat */
  if (contactUser.chat === undefined) {
    ctx.response.body = JSON.stringify({
      msg_type: ERROR,
      msg: NOT_HAVE_A_CHAT,
    });
    return;
  }

  ctx.response.body = JSON.stringify({
    msg_type: SUCCESS,
    msg: {
      chat_id: contactUser.chat,
    },
  });
};
