import { Context } from "@oak/oak";
import { renderFileToString } from "@syumai/dejs";
import { verify } from "https://deno.land/x/djwt@v2.2/mod.ts";
import { JWT_SECRET } from "../config.ts";

export const getHome = async (ctx: Context) => {
  const accessToken = await ctx.cookies.get("access_token");
  let isAuthenticated: boolean = false;
  let hashedUsername = null;

  if (accessToken !== undefined) {
    try {
      const payload = await verify(accessToken, JWT_SECRET, "HS512");
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
