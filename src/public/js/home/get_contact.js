document.addEventListener("DOMContentLoaded", async () => {
  const contactListUL = document.getElementById("contact_list");
  const r = await fetch("/list_contact");
  const j = await r.json();

  j.contactList.forEach((e) => {
    const li = document.createElement("li");
    li.innerText = e.nickName;
    li.classList.add("contact");
    li.setAttribute("data-hashedUsername", e.hashedUsername);
    contactListUL.appendChild(li);
  });
});
