import { Context } from "@oak/oak";
import { ERROR } from "./message_constants.ts";

export const responseErr = (ctx: Context, msg: string) => {
  ctx.response.body = JSON.stringify({
    msg_type: ERROR,
    msg,
  });
};
