import { SUCCESS } from "../module/constants.js";

export { getChatId, makeNewChat };

/**
 * Get chat
 * @param {string} friendId
 * @returns {string | undefined} chatId
 */
const getChatId = async (friendId) => {
  const body = new URLSearchParams();
  body.append("friendId", friendId);
  return fetch("/get_single_chat", {
    body,
    method: "POST",
  }).then((r) => r.json()).then((j) => {
    if (j.msg_type === SUCCESS) {
      return j.msg.chat_id;
    }
  });
};

/**
 * Make a new chat with friend
 * @param {string} friendId
 * @returns {JSON} {msg_type, msg: {chat_id}}
 */
const makeNewChat = async (friendId) => {
  const body = new URLSearchParams();
  body.append("friendId", friendId);
  return fetch("/create_single_chat", {
    body,
    method: "POST",
  }).then((r) => r.json()).then((j) => {
    return j;
  });
};
