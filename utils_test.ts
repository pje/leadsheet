import { replaceDupesWithRepeats } from "./utils.ts";
import { assertEquals } from "./test_utils.ts";

Deno.test(replaceDupesWithRepeats.name, () => {
  const input = ["CM", "CM", "CM"];
  const result = replaceDupesWithRepeats(input);
  assertEquals(["CM", "/", "/"], result);
});
