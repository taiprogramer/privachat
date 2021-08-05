import { createJwt, verifyJwt } from "./jwt.ts";
import { assert } from "../test_deps.ts";

Deno.test("should return original payload", async () => {
  const token = await createJwt({ foo: "bar" });
  const payload = await verifyJwt(token);
  assert(payload.foo === "bar");
});
