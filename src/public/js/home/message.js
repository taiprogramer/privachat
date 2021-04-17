import { SUCCESS } from "../module/constants.js";

export { decryptMessage, encryptMessage, listMessage };

/**
 * List historical messages
 * @param {string} chatId
 * @returns {Array<Message> | undefined} messages
 */
const listMessage = async (chatId) => {
  const body = new URLSearchParams();
  body.append("chatId", chatId);
  return fetch("/list_message", {
    body,
    method: "POST",
  }).then((r) => r.json()).then((j) => {
    if (j.msg_type === SUCCESS) {
      return j.msg.messages;
    }
  });
};

/**
 * Encrypt message for both sender & receiver
 * @param {string} textMsg
 * @param {openpgp.Key} senderPub - sender public key
 * @param {openpgp.Key} receiverPub - receiver public key
 * @returns {Promise<string>} encryptedPGPMessage
 */
const encryptMessage = async (
  textMsg,
  senderPub,
  receiverPub,
) => {
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
const decryptMessage = async (
  encryptedPGPMessage,
  privateKey,
) => {
  const message = await openpgp.readMessage({
    armoredMessage: encryptedPGPMessage,
  });
  const { data: decrypted } = await openpgp.decrypt({
    message,
    privateKeys: privateKey,
  });
  return decrypted;
};
