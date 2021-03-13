import { Router } from "https://deno.land/x/oak/mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.9.3/mod.ts";

const router = new Router();

router
  .get("/", async (ctx) => {
    ctx.response.body = await renderFileToString(
      `${Deno.cwd()}/views/home.ejs`,
      {},
    );
  });

export default router;
