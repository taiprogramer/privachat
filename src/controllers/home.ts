import { Context } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.9.3/mod.ts";
import { verify } from "https://deno.land/x/djwt@v2.2/mod.ts";
import { JWT_SECRET } from "../config.ts";

export const getHome = async (ctx: Context) => {
  const accessToken = ctx.cookies.get("access_token");
  let isAuthenticated: boolean = false;
  let hashedUsername = null;

  if (accessToken !== undefined) {
    try {
      const payload = await verify(accessToken, JWT_SECRET, "HS512");
      isAuthenticated = true;
      hashedUsername = payload.usr;
    } catch (e) {
      isAuthenticated = false;
    }
  }

  ctx.response.body = await renderFileToString(
    `${Deno.cwd()}/views/home.ejs`,
    { isAuthenticated, hashedUsername },
  );
};
