import { JWT_EXP_IN_MINUTES } from "../config.ts";
import { create, getNumericDate, Payload, verify } from "@zaubrik/djwt";

let JWT_KEY: CryptoKey | null = null;

export const createJwt = async (p: Payload): Promise<string> => {
  if (JWT_KEY == null) {
    JWT_KEY = await crypto.subtle.generateKey(
      {
        name: "HMAC",
        hash: "SHA-512",
      },
      true,
      ["sign", "verify"],
    );
  }
  return await create(
    { alg: "HS512", typ: "JWT" },
    {
      ...p,
      exp: getNumericDate(parseInt(JWT_EXP_IN_MINUTES) * 60),
    },
    JWT_KEY,
  );
};

export const verifyJwt = async (t: string): Promise<Payload> => {
  return await verify(t, JWT_KEY);
};
