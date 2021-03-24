const SHA256 = new Hashes.SHA256();
const SHA512 = new Hashes.SHA512();

const tfUsername = document.getElementById("tf_username");
const pfPassword = document.getElementById("pf_password");
const tfHashedUsername = document.getElementById("tf_hashed_username");
const pfAuthPassword = document.getElementById("pf_auth_password");
const formLogin = document.getElementById("form_login");
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

  sessionStorage.setItem("username", tfUsername.value);
  sessionStorage.setItem("local_password", localPassword);
  formLogin.submit();
}
