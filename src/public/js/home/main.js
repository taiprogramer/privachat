import {
  createContactItems,
  getContactList,
  showContactItems,
} from "./contact.js";

let selectedContactItem =
  document.getElementsByClassName("contact-selected")[0];
const spanFriendNickname = document.getElementById("friend_nickname");

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
};
