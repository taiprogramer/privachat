import { SUCCESS } from "../module/constants.js";
import { correctPrivateKey, correctPublicKey } from "./key.js";

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
 * @param {string} unformatSenderPub - unformat sender public key
 * @param {string} unformatReceiverPub - unformat receiver public key
 * @returns {Promise<string>} encryptedPGPMessage
 */
const encryptMessage = async (
  textMsg,
  unformatSenderPub,
  unformatReceiverPub,
) => {
  const publicKeysArmored = [
    correctPublicKey(unformatSenderPub),
    correctPublicKey(unformatReceiverPub),
  ];
  const publicKeys = await Promise.all(
    publicKeysArmored.map((armoredKey) => openpgp.readKey({ armoredKey })),
  );
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
 * @param {string} unformatPrivateKey
 * @param {string} localPassword - password use for decrypting private key
 * @return {Promise<string>} textMsg
 */
const decryptMessage = async (
  encryptedPGPMessage,
  unformatPrivateKey,
  localPassword,
) => {
  const privateKeyArmored = correctPrivateKey(unformatPrivateKey);
  const privateKey = await openpgp.readKey({ armoredKey: privateKeyArmored });
  await privateKey.decrypt(localPassword);
  const message = await openpgp.readMessage({
    armoredMessage: encryptedPGPMessage,
  });
  const { data: decrypted } = await openpgp.decrypt({
    message,
    privateKeys: privateKey,
  });
  return decrypted;
};
