import { Context } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { ERROR } from "./message_constants.ts";

export const responseErr = (ctx: Context, msg: string) => {
  ctx.response.body = JSON.stringify({
    msg_type: ERROR,
    msg,
  });
};
