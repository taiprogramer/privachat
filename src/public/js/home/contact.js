export { createContactItems, getContactList };

/**
 * Get list of contact
 * @reurns {Promise<Array>}
 */
const getContactList = async () => {
  const response = await fetch("/list_contact");
  const json = await response.json();
  return json.contactList || [];
};

/**
 * Create list of contact items (li element)
 * @param {Array} contactList
 * @returns {Array<HTMLLIElement>}
 */
const createContactItems = (contactList = []) => {
  const contactItems = [];
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
