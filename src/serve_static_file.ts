import { Context, send } from "https://deno.land/x/oak@v6.5.0/mod.ts";

export const serveStaticFile = async (ctx: Context, next: Function) => {
  const path = `${Deno.cwd()}/public${ctx.request.url.pathname}`;
  if (await fileExist(path)) {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/public`,
    });
    return;
  }
  await next();
};

async function fileExist(path: string): Promise<boolean> {
  try {
    const stats = await Deno.lstat(path);
    return stats && stats.isFile;
  } catch (e) {
    if (e && e instanceof Deno.errors.NotFound) {
      return false;
    }
    throw e;
  }
}
