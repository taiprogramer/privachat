let selectedContactItem =
  document.getElementsByClassName("contact-selected")[0];

document.addEventListener("DOMContentLoaded", async () => {
  const contactListUL = document.getElementById("contact_list");
  const contactList = await getContactList();
  const contactItems = createContactItems(contactList);
  for (let i = 0; i < contactItems.length; ++i) {
    attachOnClickEvent(contactItems[i], contactItemClicked);
  }
  showContactItems(contactItems, contactListUL);
});

/**
 * Get list of contact
 * @reurns {Promise<Array>}
 */
const getContactList = async () => {
  return fetch("/list_contact").then((r) => r.json()).then((j) => {
    return j.contactList;
  }).catch((_) => {
    return new Array();
  });
};

/**
 * Create list of contact items (li element)
 * @param {Array} contactList
 * @returns {Array<HTMLLIElement>}
 */
const createContactItems = (contactList = []) => {
  let contactItems = [];
  contactList.forEach((e) => {
    const li = document.createElement("li");
    li.innerText = e.nickName;
    li.classList.add("contact");
    li.setAttribute("data-uid", e.hashedUsername);
    contactItems.push(li);
  });
  return contactItems;
};

/**
 * Show contact items (list of li elements) to DOM.
 * @param {HTMLLIElement} contactItems
 * @param {HTMLUListElement} ul
 */
const showContactItems = async (contactItems, ul) => {
  contactItems.forEach((item) => {
    ul.appendChild(item);
  });
};

/**
 * Attach onclick event on single contact item (li element).
 *
 * @param {HTMLLIElement} contactItem
 * @param {Function} handlerFunc
 */
const attachOnClickEvent = (contactItem, handlerFunc) => {
  contactItem.onclick = handlerFunc;
};

const contactItemClicked = function () {
  if (selectedContactItem === this) {
    return;
  }
  selectedContactItem.classList.remove("contact-selected");
  this.classList.add("contact-selected");
  selectedContactItem = this;
  const body = new URLSearchParams();
  body.append("friendId", this.getAttribute("data-uid"));
  fetch("/get_single_chat", {
    body,
    method: "POST",
  }).then((r) => r.json()).then((j) => console.log(j));
};
