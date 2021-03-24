const SHA256 = new Hashes.SHA256();
const SHA512 = new Hashes.SHA512();

const tfUsername = document.getElementById("tf_username");
const pfPassword = document.getElementById("pf_password");
const tfHashedUsername = document.getElementById("tf_hashed_username");
const pfAuthPassword = document.getElementById("pf_auth_password");
const tfPublicKey = document.getElementById("tf_public_key");
const tfEncryptedPrivateKey = document.getElementById(
  "tf_encrypted_private_key",
);
const formCreateNewAccount = document.getElementById("form_create_new_account");
const formUserInfo = document.getElementById("form_user_info");

formUserInfo.onsubmit = (e) => {
  e.preventDefault();
  performSubmit();
};

async function performSubmit() {
  const hashedUsername = SHA256.hex(tfUsername.value);
  /* local password use for encrypting private key */
  const localPassword = SHA512.hex(pfPassword.value);
  /* authentication password use for authentication */
  /* ensure end-to-end encryption */
  const authPassword = SHA512.hex(localPassword);

  tfHashedUsername.value = hashedUsername;
  pfAuthPassword.value = authPassword;

  /* Generate new key pair */
  const { privateKeyArmored, publicKeyArmored } = await openpgp.generateKey({
    type: "ecc",
    curve: "curve25519",
    userIds: [{ name: hashedUsername, email: `${hashedUsername}@pseudo.mail` }],
    passphrase: localPassword,
  });

  tfPublicKey.value = publicKeyArmored;
  tfEncryptedPrivateKey.value = privateKeyArmored;
  formCreateNewAccount.submit();
}
