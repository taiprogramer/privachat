import { Router } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.9.3/mod.ts";
import {
  getCreateNewAccount,
  postCreateNewAccount,
} from "./controllers/accounts.ts";

const router = new Router();

router
  .get("/", async (ctx) => {
    ctx.response.body = await renderFileToString(
      `${Deno.cwd()}/views/home.ejs`,
      {},
    );
  })
  .post("/create_new_account", postCreateNewAccount)
  .get("/create_new_account", getCreateNewAccount);

export default router;
