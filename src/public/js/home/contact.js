export { createContactItems, getContactList, showContactItems };

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
    li.setAttribute("data-nickname", e.nickName);
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
