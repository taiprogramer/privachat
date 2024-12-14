import { Context } from "@oak/oak";
import { isSHAhex, isStringEmpty } from "../helpers/string_validator.ts";
import { responseErr } from "../helpers/response.ts";
import {
  FRIEND_DOES_NOT_KNOW_YOU,
  INVALID_DATA,
  MESSAGE_SENT,
  NOT_HAVE_A_CHAT,
  SUCCESS,
  UNKNOWN_ERROR,
  USER_NOT_FOUND,
  USER_NOT_IN_CONTACT,
} from "../helpers/message_constants.ts";
import { chatsCollection, usersCollection } from "../models/db.ts";
import { ContactType } from "../models/UserSchema.ts";
import { Message } from "../models/Chat.ts";
import { ObjectId } from "@db/mongo";

export { postListMessage, postSendMessage };

const postSendMessage = async (ctx: Context) => {
  const uid = ctx.state.payload.usr;
  const formValue = await ctx.request.body.form();
  const friendId = formValue.get("friendId") || "";
  const encryptedContent = formValue.get("encryptedContent") || "";

  if (
    isStringEmpty(encryptedContent) ||
    isStringEmpty(friendId) ||
    !isSHAhex({ s: friendId, numBits: 256 })
  ) {
    return responseErr(ctx, INVALID_DATA);
  }

  const user = await usersCollection.findOne({ hashedUsername: uid });
  const friend = await usersCollection.findOne({ hashedUsername: friendId });
  if (!user || !friend) {
    return responseErr(ctx, USER_NOT_FOUND);
  }

  /* make sure friend in user contact list & vice-versa */
  const userContacts: ContactType[] = user.contactList || [];
  const friendContacts: ContactType[] = friend.contactList || [];

  if (!userContacts.find((c) => c.hashedUsername === friendId)) {
    return responseErr(ctx, USER_NOT_IN_CONTACT);
  }

  const contact: ContactType | undefined = friendContacts.find(
    (c) => c.hashedUsername === uid,
  );

  if (!contact) {
    return responseErr(ctx, FRIEND_DOES_NOT_KNOW_YOU);
  }

  /* make sure they have a chat */
  const chatId = contact.chat;
  if (!chatId) {
    return responseErr(ctx, NOT_HAVE_A_CHAT);
  }

  /* create message */
  const message: Message = {
    from: uid,
    encryptedContent,
    seen: false,
    timestamp: new Date(),
  };

  /* push message at the beginning of messages */
  const updateResultObj = await chatsCollection.updateOne(
    { _id: chatId },
    {
      $push: {
        messages: {
          $each: [message],
          $position: 0,
        },
      },
    },
  );
  if (!updateResultObj.modifiedCount) {
    return responseErr(ctx, UNKNOWN_ERROR);
  }

  ctx.response.body = JSON.stringify({
    msg_type: SUCCESS,
    msg: MESSAGE_SENT,
  });
};

const postListMessage = async (ctx: Context) => {
  const formValue = await ctx.request.body.form();
  const chatId = formValue.get("chatId") || "";
  const chat = await chatsCollection.findOne({
    _id: new ObjectId(chatId),
  });

  if (!chat) {
    return responseErr(ctx, NOT_HAVE_A_CHAT);
  }

  ctx.response.body = JSON.stringify({
    msg_type: SUCCESS,
    msg: {
      messages: chat.messages,
    },
  });
};
