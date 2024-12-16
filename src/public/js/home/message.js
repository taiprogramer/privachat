import { SUCCESS } from "../module/constants.js";

export { createMessageItem, decryptMessage, encryptMessage, listMessage };

/**
 * List historical messages
 * @param {string} chatId
 * @returns Promise<Array<Message>> messages
 */
const listMessage = async (chatId) => {
  const body = new URLSearchParams();
  body.append("chatId", chatId);
  const response = await fetch("/list_message", {
    body,
    method: "POST",
  });
  const json = await response.json();
  if (json.msg_type === SUCCESS) {
    return json.msg.messages;
  }
  return [];
};

/**
 * Encrypt message for both sender & receiver
 * @param {string} textMsg
 * @param {openpgp.Key} senderPub - sender public key
 * @param {openpgp.Key} receiverPub - receiver public key
 * @returns {Promise<string>} encryptedPGPMessage
 */
const encryptMessage = async (textMsg, senderPub, receiverPub) => {
  const publicKeys = [senderPub, receiverPub];
  const message = await openpgp.Message.fromText(textMsg);
  const encryptedPGPMessage = await openpgp.encrypt({
    message,
    publicKeys: publicKeys,
  });
  return encryptedPGPMessage;
};

/**
 * Decrypt message
 * @param {string} encryptedPGPMessage - pgp message ascii
 * @param {openpgp.Key} privateKey
 * @return {Promise<string>} textMsg
 */
const decryptMessage = async (encryptedPGPMessage, privateKey) => {
  const message = await openpgp.readMessage({
    armoredMessage: encryptedPGPMessage,
  });
  const { data: decrypted } = await openpgp.decrypt({
    message,
    privateKeys: privateKey,
  });
  return decrypted;
};

/**
 * Create message item (li element)
 * @param {string} textMsg - Message after decrypt
 * @param {Date} timestamp
 * @param {string} sender - nickname
 * @returns {HTMLLIElement} messageItem
 */
const createMessageItem = (textMsg, timestamp, sender = "Me") => {
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
  pContent.innerText = textMsg;

  const date = new Date(timestamp);
  spanTimestamp.innerText = `${date.getHours()}:${
    date.getMinutes() < 10 ? "0" : ""
  }${date.getMinutes()}`;

  if (sender !== "Me") {
    li.classList.remove("message-own");
    li.classList.add("message-friend");
    bSender.innerText = sender;
  }

  li.appendChild(bSender);
  li.appendChild(pContent);
  li.appendChild(spanTimestamp);
  return li;
};
