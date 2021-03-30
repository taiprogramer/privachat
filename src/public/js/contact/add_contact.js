const SHA256 = new Hashes.SHA256();

const tfUsername = document.getElementById("tf_username");
const tfHashedUsername = document.getElementById("tf_hashed_username");
tfUsername.onkeyup = () => {
  tfHashedUsername.value = SHA256.hex(tfUsername.value);
};
