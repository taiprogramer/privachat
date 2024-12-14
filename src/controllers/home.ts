import { Context } from "@oak/oak";
import { renderFileToString } from "@syumai/dejs";
import { verifyJwt } from "../helpers/jwt.ts";

export const getHome = async (ctx: Context) => {
  const accessToken = await ctx.cookies.get("access_token");
  let isAuthenticated: boolean = false;
  let hashedUsername = null;

  if (accessToken !== undefined) {
    try {
      const payload = await verifyJwt(accessToken);
      isAuthenticated = true;
      hashedUsername = payload.usr;
    } catch {
      isAuthenticated = false;
    }
  }

  ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/home.ejs`, {
    isAuthenticated,
    hashedUsername,
  });
};
