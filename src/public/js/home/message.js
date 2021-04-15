import { SUCCESS } from "../module/constants.js";

export { listMessage };

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
