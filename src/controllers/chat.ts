import { Context } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { isSHAhex, isStringEmpty } from "../helpers/string_validator.ts";
import {
  ALREADY_HAVE_A_CHAT,
  FRIEND_DOES_NOT_KNOW_YOU,
  INVALID_DATA,
  NOT_HAVE_A_CHAT,
  SUCCESS,
  UNKNOWN_ERROR,
  USER_NOT_FOUND,
  USER_NOT_IN_CONTACT,
} from "../helpers/message_constants.ts";
import { chatsCollection, usersCollection } from "../models/db.ts";
import { ContactType } from "../models/UserSchema.ts";
import { responseErr } from "../helpers/response.ts";

export { postCreateSingleChat, postGetSingleChat };

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
    return responseErr(ctx, INVALID_DATA);
  }

  const u = await usersCollection.findOne({ hashedUsername: uid });
  if (u === undefined) {
    return responseErr(ctx, USER_NOT_FOUND);
  }

  /* check if friendId in contactList */
  const contactList: ContactType[] = u.contactList || [];
  const contactUser = contactList.find((c: ContactType) =>
    c.hashedUsername === friendId
  );

  if (contactUser === undefined) {
    return responseErr(ctx, USER_NOT_IN_CONTACT);
  }

  /* check if friendId have a chat */
  if (contactUser.chat === undefined) {
    return responseErr(ctx, NOT_HAVE_A_CHAT);
  }

  ctx.response.body = JSON.stringify({
    msg_type: SUCCESS,
    msg: {
      chat_id: contactUser.chat,
    },
  });
};

/* Create a new chat with friend */
const postCreateSingleChat = async (ctx: Context) => {
  const uid = ctx.state.payload.usr;
  const bodyValue = await ctx.request.body({ type: "form" }).value;
  const friendId = bodyValue.get("friendId") || "";
  /* validate data */
  if (isStringEmpty(friendId) || !isSHAhex({ s: friendId, numBits: 256 })) {
    return responseErr(ctx, INVALID_DATA);
  }

  const u = await usersCollection.findOne({ hashedUsername: uid });
  const friend = await usersCollection.findOne({ hashedUsername: friendId });

  if (u === undefined || friend === undefined) {
    return responseErr(ctx, USER_NOT_FOUND);
  }

  /* check if friendId in contactList */
  const contactList: ContactType[] = u.contactList || [];
  const contactUser = contactList.find((c: ContactType) =>
    c.hashedUsername === friendId
  );

  if (contactUser === undefined) {
    return responseErr(ctx, USER_NOT_IN_CONTACT);
  }

  /* check if already have a chat */
  if (contactUser.chat !== undefined) {
    return responseErr(ctx, ALREADY_HAVE_A_CHAT);
  }

  /* check if friend does not know u */
  const friendContacts: ContactType[] = friend.contactList || [];
  const uInFriendContacts = friendContacts.find((c) => {
    c.hashedUsername === uid;
  });

  if (uInFriendContacts === undefined) {
    return responseErr(ctx, FRIEND_DOES_NOT_KNOW_YOU);
  }

  /* create a new chat between u and friend */
  const insertedId = await chatsCollection.insertOne({ messages: [] });
  if (!insertedId) {
    return responseErr(ctx, UNKNOWN_ERROR);
  }

  /* add chat id to contact field on both side */
  const resultObj1 = await usersCollection
    .updateOne({
      hashedUsername: uid,
      "contactList.hashedUsername": friendId,
    }, { $set: { "contactList.$.chat": insertedId } });

  const resultObj2 = await usersCollection
    .updateOne({
      hashedUsername: friendId,
      "contactList.hashedUsername": uid,
    }, { $set: { "contactList.$.chat": insertedId } });

  if (!resultObj1.upsertedId || !resultObj2.upsertedId) {
    return responseErr(ctx, UNKNOWN_ERROR);
  }

  ctx.response.body = JSON.stringify({
    msg_type: SUCCESS,
    msg: {
      chat_id: insertedId,
    },
  });
};
