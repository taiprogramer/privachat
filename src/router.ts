import { Router } from "@oak/oak";
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
import { postListMessage, postSendMessage } from "./controllers/message.ts";

import { postCreateSingleChat, postGetSingleChat } from "./controllers/chat.ts";
import {
  postGetEncryptedPrivateKey,
  postGetPublicKey,
} from "./controllers/key.ts";
import { ws } from "./controllers/ws.ts";

const router = new Router();

router
  .get("/", getHome)
  .post("/create_new_account", postCreateNewAccount)
  .get("/create_new_account", toHomeIfLoggedIn, getCreateNewAccount)
  .get("/login", toHomeIfLoggedIn, getLogin)
  .post("/login", postLogin)
  .get("/logout", getLogout)
  .post("/add_contact", checkAuth, postAddContact)
  .get("/add_contact", checkAuth, getAddContact)
  .get("/list_contact", checkAuth, getListContact)
  .post("/get_single_chat", checkAuth, postGetSingleChat)
  .post("/create_single_chat", checkAuth, postCreateSingleChat)
  .post("/send_message", checkAuth, postSendMessage)
  .post("/list_message", checkAuth, postListMessage)
  .post("/get_public_key", postGetPublicKey)
  .post("/get_encrypted_private_key", checkAuth, postGetEncryptedPrivateKey)
  .get("/ws", checkAuth, ws);

export default router;
