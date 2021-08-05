import { JWT_EXP_IN_MINUTES, JWT_SECRET } from "../config.ts";
import { create, getNumericDate, Payload, verify } from "../deps.ts";

export const createJwt = async (p: Payload): Promise<string> => {
  return await create({ alg: "HS512", typ: "JWT" }, {
    ...p,
    exp: getNumericDate(parseInt(JWT_EXP_IN_MINUTES) * 60),
  }, JWT_SECRET);
};

export const verifyJwt = async (t: string): Promise<Payload> => {
  return await verify(t, JWT_SECRET, "HS512");
};
