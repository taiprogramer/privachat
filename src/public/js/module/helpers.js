import { ERROR, SUCCESS } from "./constants.js";

export function notify(msg, msgType, duration, element) {
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
