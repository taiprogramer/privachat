import { notify } from "../module/helpers.js";

const SHA256 = new Hashes.SHA256();
const SHA512 = new Hashes.SHA512();

const tfUsername = document.getElementById("tf_username");
const pfPassword = document.getElementById("pf_password");
const formUserInfo = document.getElementById("form_user_info");
const divNotification = document.getElementById("notification");

formUserInfo.onsubmit = async (e) => {
  e.preventDefault();
  /* enhance privacy */
  const hashedUsername = SHA256.hex(tfUsername.value);
  /* local password use for encrypting private key */
  const localPassword = SHA512.hex(pfPassword.value);
  /* authentication password use for authentication */
  /* ensure end-to-end encryption */
  const authPassword = SHA512.hex(localPassword);

  /* Generate new key pair */
  const { privateKeyArmored, publicKeyArmored } = await openpgp.generateKey({
    type: "ecc",
    curve: "curve25519",
    userIds: [{ name: hashedUsername, email: `${hashedUsername}@pseudo.mail` }],
    passphrase: localPassword,
  });

  const body = new URLSearchParams({
    hashed_username: SHA256.hex(tfUsername.value),
    auth_password: authPassword,
    public_key: publicKeyArmored,
    encrypted_private_key: privateKeyArmored,
  });

  const json = await fetch("/create_new_account", {
    method: "POST",
    body,
  }).then((r) => r.json());

  notify(json.msg, json.msg_type, 3000, divNotification);
};
