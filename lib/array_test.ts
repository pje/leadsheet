import { zip } from "./array.ts";
import { assertEquals } from "../test_utils.ts";

Deno.test(zip.name, () => {
  const a1 = ["a", "b", "c"];
  const a2 = [1, 2, 3, 4];
  const result = zip(a1, a2);
  assertEquals([["a", 1], ["b", 2], ["c", 3]], result);
});
