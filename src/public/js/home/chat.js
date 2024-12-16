import { SUCCESS } from "../module/constants.js";

export { getChatId, makeNewChat };

/**
 * Get chat
 * @param {string} friendId
 * @returns {Promise<string>} chatId
 */
const getChatId = async (friendId) => {
  const body = new URLSearchParams();
  body.append("friendId", friendId);
  const response = await fetch("/get_single_chat", {
    body,
    method: "POST",
  });
  const json = await response.json();
  return json.msg.chat_id;
};

/**
 * Make a new chat with friend
 * @param {string} friendId
 * @returns {Promise<JSON>} {msg_type, msg: {chat_id}}
 */
const makeNewChat = async (friendId) => {
  const body = new URLSearchParams();
  body.append("friendId", friendId);
  const response = await fetch("/create_single_chat", {
    body,
    method: "POST",
  });
  return response.json();
};
