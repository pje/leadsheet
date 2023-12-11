import { groupsOf, zip } from "./array.ts";
import { assertEquals } from "../test_utils.ts";

Deno.test(zip.name, () => {
  const a1 = ["a", "b", "c"];
  const a2 = [1, 2, 3, 4];
  const result = zip(a1, a2);
  assertEquals([["a", 1], ["b", 2], ["c", 3]], result);
});

Deno.test(groupsOf.name, () => {
  const a = ["a", "b", "c", "d", "e"];
  const result = groupsOf(a, 2);
  assertEquals([["a", "b"], ["c", "d"], ["e"]], result);
});
