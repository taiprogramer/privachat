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
import { getAddContact, postAddContact } from "./controllers/contact.ts";

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
  .get("/add_contact", checkAuth, getAddContact);

export default router;
