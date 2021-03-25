import { Router } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import {
  getCreateNewAccount,
  getLogin,
  getLogout,
  postCreateNewAccount,
  postLogin,
  toHomeIfAuthenticatedMiddleware,
} from "./controllers/accounts.ts";
import { getHome } from "./controllers/home.ts";

const router = new Router();

router
  .get("/", getHome)
  .post("/create_new_account", postCreateNewAccount)
  .get(
    "/create_new_account",
    toHomeIfAuthenticatedMiddleware,
    getCreateNewAccount,
  )
  .get("/login", toHomeIfAuthenticatedMiddleware, getLogin)
  .post("/login", postLogin)
  .get("/logout", getLogout);

export default router;
