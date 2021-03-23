const SHA256 = new Hashes.SHA256();
const SHA512 = new Hashes.SHA512();

async function performSubmit(
  {
    tfHashedUsername,
    pfAuthPassword,
    tfPublicKey,
    tfEncryptedPrivateKey,
    tfUsername,
    pfPassword,
    btnSubmit,
  },
) {
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

  await btnSubmit.click();
}
