import { Router } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import {
  getCreateNewAccount,
  getLogin,
  getLogout,
  postCreateNewAccount,
  postLogin,
  toHomeIfLoggedIn,
} from "./controllers/accounts.ts";
import { getHome } from "./controllers/home.ts";

const router = new Router();

router
  .get("/", getHome)
  .post("/create_new_account", postCreateNewAccount)
  .get(
    "/create_new_account",
    toHomeIfLoggedIn,
    getCreateNewAccount,
  )
  .get("/login", toHomeIfLoggedIn, getLogin)
  .post("/login", postLogin)
  .get("/logout", getLogout);

export default router;
