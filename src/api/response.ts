import { Context, Status } from "../deps.ts";

export const responseErr = (ctx: Context, status: Status, msg: string) => {
  ctx.response.status = status;
  ctx.response.body = {
    success: false,
    cause: {
      msg,
    },
  };
};

export const responseSuc = (ctx: Context, status: Status, data: Object) => {
  ctx.response.status = status;
  ctx.response.body = {
    success: true,
    data,
  };
};
