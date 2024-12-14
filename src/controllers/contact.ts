import { Context } from "@oak/oak";
import { usersCollection } from "../models/db.ts";
import { renderFileToString } from "@syumai/dejs";
import { isSHAhex, isStringEmpty } from "../helpers/string_validator.ts";
import { ContactType, UserSchema } from "../models/UserSchema.ts";
import {
  ERROR,
  INVALID_DATA,
  SUCCESS,
  USER_NOT_FOUND,
  YOU_ALREADY_KNOW_YOU,
} from "../helpers/message_constants.ts";
import { responseErr } from "../helpers/response.ts";

export { getAddContact, getListContact, postAddContact };

const postAddContact = async (ctx: Context) => {
  const formValue = await ctx.request.body.form();
  const contactHashedUsername = formValue.get("hashed_username") || "";
  const nickName = formValue.get("nickname") || "";

  if (
    isStringEmpty(contactHashedUsername) ||
    !isSHAhex({ s: contactHashedUsername, numBits: 256 }) ||
    isStringEmpty(nickName)
  ) {
    return responseErr(ctx, INVALID_DATA);
  }

  const contact: ContactType = {
    hashedUsername: contactHashedUsername,
    nickName,
  };

  const payload = ctx.state.payload;

  const user = await usersCollection.findOne({ hashedUsername: payload.usr });
  const contactUser = await usersCollection.findOne({
    hashedUsername: contactHashedUsername,
  });
  if (user === undefined || contactUser === undefined) {
    return responseErr(ctx, USER_NOT_FOUND);
  }

  if (user.hashedUsername === contactUser.hashedUsername) {
    return responseErr(ctx, YOU_ALREADY_KNOW_YOU);
  }

  /* have no friend */
  /* arg1 || arg2 return arg1 if arg1 turn to true otherwise arg2 */
  let contactList: ContactType[] = user.contactList || [];

  /* maybe contact user already be in contactList of user */
  const contactAlready: any = contactList.find(
    (c: ContactType) => c.hashedUsername === contactUser.hashedUsername,
  );
  if (contactAlready !== undefined) {
    return responseErr(
      ctx,
      `You already added ${contactAlready.hashedUsername.substring(
        0,
        15,
      )} as ${contactAlready.nickName}.`,
    );
  }
  if (await addContactDB(user, [...contactList, contact])) {
    ctx.response.body = JSON.stringify({
      msg: `Added ${contact.hashedUsername.substring(
        0,
        15,
      )} as ${contact.nickName}.`,
      msg_type: SUCCESS,
    });
    return;
  }

  ctx.response.body = JSON.stringify({
    msg: "Something wrong, maybe our database went down.",
    msg_type: ERROR,
  });
};

const getAddContact = async (ctx: Context) => {
  ctx.response.body = await renderFileToString(
    `${Deno.cwd()}/views/contact/add_contact.ejs`,
    {},
  );
};

const addContactDB = async (
  u: UserSchema,
  contactList: ContactType[],
): Promise<boolean> => {
  /* add contact to db */
  try {
    await usersCollection.updateOne(
      { hashedUsername: u.hashedUsername },
      {
        $set: { contactList },
      },
    );
    return true;
  } catch {
    return false;
  }
};

const getListContact = async (ctx: Context) => {
  const hashedUsername = ctx.state.payload.usr;
  const u = await usersCollection.findOne({ hashedUsername });
  if (u !== undefined) {
    ctx.response.body = JSON.stringify({
      contactList: u.contactList,
    });
  }
};
