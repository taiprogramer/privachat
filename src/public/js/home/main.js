import { createContactItems, getContactList } from "./contact.js";
import { getChatId, makeNewChat } from "./chat.js";
import {
  createMessageItem,
  decryptMessage,
  encryptMessage,
  listMessage,
} from "./message.js";
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
const ulContactList = document.getElementById("contact_list");
const tfMessage = document.getElementById("tf_message");
const h1User = document.getElementById("user");
/* lock li element on clicking when messages are loading */
let lockContactItems = false;
let userPrivateKey = undefined; // type: openpgp.Key
let userPublicKey = undefined; // type: openpgp.Key

/*
contacts: HashMap
{
    uid(SHA256): {
	nickname: string,
	public_key: openpgp.Key,
	messages: [HTMLLIElement]
    }
}
*/
const contacts = {};
const ws = new WebSocket(`ws://${document.location.host}/ws`);

ws.onmessage = async ({ data }) => {
  const { from: friendId } = JSON.parse(data);
  const chatId = await getChatId(friendId);
  const messages = await listMessage(chatId) || [];
  if (messages.length < 1) {
    return;
  }

  const textMsg = await decryptMessage(
    messages[0].encryptedContent,
    userPrivateKey,
  );
  const li = createMessageItem(
    textMsg,
    messages[0].timestamp,
    contacts[friendId].nickname,
  );

  if (contacts[friendId].messages) {
    contacts[friendId].messages.unshift(li);
  }

  if (selectedContactItem.getAttribute("data-uid") === friendId) {
    ulMessages.appendChild(li);
    ulMessages.scrollTo(0, ulMessages.scrollHeight);
  }
};

/*
 ____  _____    _    ____  __  __ _____
|  _ \| ____|  / \  |  _ \|  \/  | ____|
| |_) |  _|   / _ \ | | | | |\/| |  _|
|  _ <| |___ / ___ \| |_| | |  | | |___
|_| \_\_____/_/   \_\____/|_|  |_|_____| */
document.addEventListener("DOMContentLoaded", async () => {
  const contactItems = createContactItems(await getContactList());
  for (let i = 0; i < contactItems.length; ++i) {
    contactItems[i].onclick = contactItemClicked;
    ulContactList.appendChild(contactItems[i]);
    const uid = contactItems[i].getAttribute("data-uid");
    contacts[uid] = {
      nickname: contactItems[i].getAttribute("data-nickname"),
      public_key: await openpgp.readKey({
        armoredKey: correctPublicKey(await getPublicKey(uid)),
      }),
      messages: undefined,
    };
  }

  tfMessage.onkeyup = (e) => {
    if (e.key === "Enter") {
      tfMessageEnter();
    }
  };
  /* set up user info */
  userPrivateKey = await openpgp.readKey({
    armoredKey: correctPrivateKey(await getEncryptedPrivateKey()),
  });
  await userPrivateKey.decrypt(sessionStorage.getItem("local_password"));
  userPublicKey = await openpgp.readKey({
    armoredKey: correctPublicKey(
      await getPublicKey(h1User.getAttribute("data-uid")),
    ),
  });
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
  if (contacts[friendId].messages) {
    ulMessages.innerText = "";
    for (const message of contacts[friendId].messages) {
      ulMessages.insertBefore(message, ulMessages.firstChild);
      ulMessages.scrollTo(0, ulMessages.scrollHeight);
    }
    return;
  }
  const chatId = await getChatId(friendId);
  if (!chatId) {
    const json = await makeNewChat(friendId);
    ulMessages.innerText = json.msg;
    return;
  }
  const messages = await listMessage(chatId) || [];
  ulMessages.innerText = "";

  contacts[friendId].messages = [];
  for (const message of messages) {
    const textMsg = await decryptMessage(
      message.encryptedContent,
      userPrivateKey,
    );
    const sender = message.from === friendId
      ? contacts[friendId].nickname
      : "Me";
    const li = createMessageItem(textMsg, message.timestamp, sender);
    contacts[friendId].messages.push(li);
    /* simulate prependChild - Thanks Denis Vlasov */
    /* http://www.denisvlasov.net/129/javascript-prependchild/ */
    ulMessages.insertBefore(li, ulMessages.firstChild);
    ulMessages.scrollTo(0, ulMessages.scrollHeight);
  }
};

const tfMessageEnter = async () => {
  const friendId = selectedContactItem.getAttribute("data-uid");
  const encryptedPGPMessage = await encryptMessage(
    tfMessage.value,
    userPublicKey,
    contacts[friendId].public_key,
  );
  const li = createMessageItem(tfMessage.value, new Date(), "Me");
  const body = new URLSearchParams();
  body.append("friendId", selectedContactItem.getAttribute("data-uid"));
  body.append("encryptedContent", encryptedPGPMessage);
  fetch("/send_message", {
    body,
    method: "POST",
  }).then((r) => r.json()).then((j) => {
    if (j.msg_type === SUCCESS) {
      tfMessage.value = "";
      ulMessages.appendChild(li);
      ulMessages.scrollTo(0, ulMessages.scrollHeight);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          from: h1User.getAttribute("data-uid"),
          to: friendId,
        }));
      }
    }
  });
};
