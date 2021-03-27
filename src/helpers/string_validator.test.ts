import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

import { isSHAhex, isStringEmpty } from "./string_validator.ts";

Deno.test("isStringEmpty", () => {
  const s1 = "";
  const s2 = "foo";
  assertEquals(isStringEmpty(s1), true);
  assertEquals(isStringEmpty(s2), false);
});

Deno.test("isSHAhex", () => {
  const validSHA256Hex =
    "c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2";
  const unvalidSHA256Hex =
    "@3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2";
  assertEquals(isSHAhex({ s: validSHA256Hex, numBits: 256 }), true);
  assertEquals(isSHAhex({ s: unvalidSHA256Hex, numBits: 256 }), false);
});
