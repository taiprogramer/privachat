import {
  createContactItems,
  getContactList,
  showContactItems,
} from "./contact.js";
import { getChatId, makeNewChat } from "./chat.js";
import { decryptMessage, encryptMessage, listMessage } from "./message.js";
import {
  correctPrivateKey,
  correctPublicKey,
  getEncryptedPrivateKey,
  getPublicKey,
} from "./key.js";
import { SUCCESS } from "../module/constants.js";

let selectedContactItem =
  document.getElementsByClassName("contact-selected")[0];
const spanFriendNickname = document.getElementById("friend_nickname");
const ulMessages = document.getElementById("messages");
const tfMessage = document.getElementById("tf_message");
const h1User = document.getElementById("user");
/* lock li element on clicking when messages are loading */
let lockContactItems = false;

/*
 ____  _____    _    ____  __  __ _____ 
|  _ \| ____|  / \  |  _ \|  \/  | ____|
| |_) |  _|   / _ \ | | | | |\/| |  _|  
|  _ <| |___ / ___ \| |_| | |  | | |___ 
|_| \_\_____/_/   \_\____/|_|  |_|_____| */
document.addEventListener("DOMContentLoaded", async () => {
  const contactListUL = document.getElementById("contact_list");
  const contactItems = createContactItems(await getContactList());
  for (let i = 0; i < contactItems.length; ++i) {
    contactItems[i].onclick = contactItemClicked;
  }
  showContactItems(contactItems, contactListUL);
  tfMessage.onkeyup = (e) => {
    if (e.key === "Enter") {
      tfMessageEnter();
    }
  };
});

const contactItemClicked = async function () {
  if (selectedContactItem === this || lockContactItems) {
    return;
  }
  selectedContactItem.classList.remove("contact-selected");
  this.classList.add("contact-selected");
  selectedContactItem = this;
  spanFriendNickname.innerText = selectedContactItem.getAttribute(
    "data-nickname",
  );
  lockContactItems = true;
  await startChat(selectedContactItem.getAttribute("data-uid"));
  lockContactItems = false;
};

/**
 * Create a new chat or show list of messages.
 * If any error, signalling situation.
 * @param {string} friendId
 */
const startChat = async (friendId) => {
  const chatId = await getChatId(friendId);
  if (!chatId) {
    const json = await makeNewChat(friendId);
    ulMessages.innerText = json.msg;
    return;
  }
  const messages = await listMessage(chatId) || [];
  ulMessages.innerText = "";
  for (const message of messages) {
    const li = document.createElement("li");
    const bSender = document.createElement("b");
    const pContent = document.createElement("p");
    const spanTimestamp = document.createElement("span");

    // general
    li.classList.add("message");
    li.classList.add("message-own");
    bSender.classList.add("message-sender");
    pContent.classList.add("message-content");
    spanTimestamp.classList.add("message-timestamp");
    bSender.innerText = "Me";
    const msg = await decryptMessage(
      message.encryptedContent,
      await getEncryptedPrivateKey(),
      sessionStorage.getItem("local_password"),
    );
    pContent.innerText = msg;
    const date = new Date(message.timestamp);
    spanTimestamp.innerText = `${date.getHours()}:${
      date.getMinutes() < 10 ? "0" : ""
    }${date.getMinutes()}`;

    if (message.from === friendId) {
      li.classList.remove("message-own");
      li.classList.add("message-friend");
      bSender.innerText = selectedContactItem.getAttribute("data-nickname");
    }

    li.appendChild(bSender);
    li.appendChild(pContent);
    li.appendChild(spanTimestamp);
    /* simulate prependChild - Thanks Denis Vlasov */
    /* http://www.denisvlasov.net/129/javascript-prependchild/ */
    ulMessages.insertBefore(li, ulMessages.firstChild);
    ulMessages.scrollTo(0, ulMessages.scrollHeight);
  }
};

const tfMessageEnter = async () => {
  const userPublicKey = await getPublicKey(
    selectedContactItem.getAttribute("data-uid"),
  );
  const friendPublicKey = await getPublicKey(h1User.getAttribute("data-uid"));
  const encryptedPGPMessage = await encryptMessage(
    tfMessage.value,
    userPublicKey,
    friendPublicKey,
  );
  const body = new URLSearchParams();
  body.append("friendId", selectedContactItem.getAttribute("data-uid"));
  body.append("encryptedContent", encryptedPGPMessage);
  fetch("/send_message", {
    body,
    method: "POST",
  }).then((r) => r.json()).then((j) => {
    if (j.msg_type === SUCCESS) {
      tfMessage.value = "";
    }
  });
};
