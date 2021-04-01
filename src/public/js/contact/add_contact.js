import { ERROR, SUCCESS } from "../module/constants.js";

const SHA256 = new Hashes.SHA256();

const divNotification = document.getElementById("notification");
const tfUsername = document.getElementById("tf_username");
const tfNickname = document.getElementById("tf_nickname");
const formAddContact = document.getElementById("form_add_contact");

formAddContact.onsubmit = async (e) => {
  e.preventDefault();

  const body = new URLSearchParams({
    hashed_username: SHA256.hex(tfUsername.value),
    nickname: tfNickname.value,
  });

  const json = await fetch("/add_contact", {
    method: "POST",
    body,
  }).then((r) => r.json());

  notify(json.msg, json.msg_type, 3000, divNotification);
};

function notify(msg, msgType, duration, element) {
  switch (msgType) {
    case ERROR:
      element.classList.remove("alert-success");
      element.classList.add("alert-danger");
      break;
    case SUCCESS:
      element.classList.remove("alert-danger");
      element.classList.add("alert-success");
      break;
  }

  element.innerText = msg;
  element.classList.remove("hidden");
  setTimeout(() => {
    element.classList.add("hidden");
  }, duration);
}
