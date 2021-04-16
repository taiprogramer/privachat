import { SUCCESS } from "../module/constants.js";

export {
  correctPrivateKey,
  correctPublicKey,
  getEncryptedPrivateKey,
  getPublicKey,
};

/**
 * Get public key of uid
 * @param {string} uid
 * @returns {Promise<string | undefined>} publicKey
 */
const getPublicKey = async (uid) => {
  const body = new URLSearchParams();
  body.append("uid", uid);
  return fetch("/get_public_key", {
    body,
    method: "POST",
  }).then((r) => r.json()).then((j) => {
    if (j.msg_type === SUCCESS) {
      return j.msg.public_key;
    }
  });
};

/**
 * Get encrypted private key
 * @returns {Promise<string | undefined>} privateKey
 */
const getEncryptedPrivateKey = async () => {
  return fetch("/get_encrypted_private_key", {
    method: "POST",
  }).then((r) => r.json()).then((j) => {
    if (j.msg_type === SUCCESS) {
      return j.msg.encrypted_private_key;
    }
  });
};

/**
 * Correct public key armored format
 * @param {string} unformatKey
 * @returns {string} formattedKey
 * */
const correctPublicKey = (key) => {
  let formattedKey = key;
  formattedKey = formattedKey.replace(
    "-----BEGIN PGP PUBLIC KEY BLOCK-----",
    "-----BEGIN PGP PUBLIC KEY BLOCK-----\n\n",
  );
  formattedKey = formattedKey.replace(
    "-----END PGP PUBLIC KEY BLOCK-----",
    "\n-----END PGP PUBLIC KEY BLOCK-----",
  );
  return formattedKey;
};
/**
 * Correct private key armored format
 * @param {string} unformatKey
 * @returns {string} formattedKey
 * */
const correctPrivateKey = (key) => {
  let formattedKey = key;
  formattedKey = formattedKey.replace(
    "-----BEGIN PGP PRIVATE KEY BLOCK-----",
    "-----BEGIN PGP PRIVATE KEY BLOCK-----\n\n",
  );
  formattedKey = formattedKey.replace(
    "-----END PGP PRIVATE KEY BLOCK-----",
    "\n-----END PGP PRIVATE KEY BLOCK-----",
  );
  return formattedKey;
};
