import { groupsOf, partition, zip } from "./array.ts";
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

Deno.test(partition.name, () => {
  const a = [1, 2, 3, 4, 5, 6];
  const isEven = (n: number) => n % 2 === 0;
  const result = partition(a, isEven);
  assertEquals([[2, 4, 6], [1, 3, 5]], result);
});
