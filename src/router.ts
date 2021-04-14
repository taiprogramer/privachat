import { Router } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import {
  checkAuth,
  getCreateNewAccount,
  getLogin,
  getLogout,
  postCreateNewAccount,
  postLogin,
  toHomeIfLoggedIn,
} from "./controllers/accounts.ts";
import { getHome } from "./controllers/home.ts";
import {
  getAddContact,
  getListContact,
  postAddContact,
} from "./controllers/contact.ts";

import { postCreateSingleChat, postGetSingleChat } from "./controllers/chat.ts";

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
  .get("/logout", getLogout)
  .post("/add_contact", checkAuth, postAddContact)
  .get("/add_contact", checkAuth, getAddContact)
  .get("/list_contact", checkAuth, getListContact)
  .post("/get_single_chat", checkAuth, postGetSingleChat)
  .post("/create_single_chat", checkAuth, postCreateSingleChat);

export default router;
