import {
  createContactItems,
  getContactList,
  showContactItems,
} from "./contact.js";
import { getChatId, makeNewChat } from "./chat.js";
import { listMessage } from "./message.js";

let selectedContactItem =
  document.getElementsByClassName("contact-selected")[0];
const spanFriendNickname = document.getElementById("friend_nickname");
const ulMessages = document.getElementById("messages");

document.addEventListener("DOMContentLoaded", async () => {
  const contactListUL = document.getElementById("contact_list");
  const contactItems = createContactItems(await getContactList());
  for (let i = 0; i < contactItems.length; ++i) {
    contactItems[i].onclick = contactItemClicked;
  }
  showContactItems(contactItems, contactListUL);
});

const contactItemClicked = function () {
  if (selectedContactItem === this) {
    return;
  }
  selectedContactItem.classList.remove("contact-selected");
  this.classList.add("contact-selected");
  selectedContactItem = this;
  spanFriendNickname.innerText = selectedContactItem.getAttribute(
    "data-nickname",
  );
  startChat(selectedContactItem.getAttribute("data-uid"));
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
    console.log(json);
    return;
  }
  const messages = await listMessage(chatId) || [];
  console.log(messages);
  messages.forEach((message) => {
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
    pContent.innerText = message.encryptedContent;
    spanTimestamp.innerText = message.timestamp;

    if (message.from === friendId) {
      li.classList.remove("message-own");
      li.classList.add("message-friend");
      bSender.innerText = selectedContactItem.getAttribute("data-nickname");
    }

    li.appendChild(bSender);
    li.appendChild(pContent);
    li.appendChild(spanTimestamp);
    ulMessages.appendChild(li);
  });
};
