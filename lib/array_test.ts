import { compact, groupsOf, partition, zip } from "./array.ts";
import { assertEquals } from "../test_utils.ts";

Deno.test(compact.name, () => {
  const a = [1, 2, undefined, 3, null, 4];
  const result = compact(a);
  assertEquals([1, 2, 3, 4], result);
});

Deno.test(groupsOf.name, () => {
  const a = ["a", "b", "c", "d", "e"];
  const result2 = groupsOf(a, 2);
  assertEquals([["a", "b"], ["c", "d"], ["e"]], result2);

  const result3 = groupsOf(a, 3);
  assertEquals([["a", "b", "c"], ["d", "e"]], result3);

  const result4 = groupsOf(a, 4);
  assertEquals([["a", "b", "c", "d"], ["e"]], result4);

  const result5 = groupsOf(a, 5);
  assertEquals([["a", "b", "c", "d", "e"]], result5);
});

Deno.test(partition.name, () => {
  const a = [1, 2, 3, 4, 5, 6];
  const isEven = (n: number) => n % 2 === 0;
  const result = partition(a, isEven);
  assertEquals([[2, 4, 6], [1, 3, 5]], result);
});

Deno.test(zip.name, () => {
  const a1 = ["a", "b", "c"];
  const a2 = [1, 2, 3, 4];
  const result = zip(a1, a2);
  assertEquals([["a", 1], ["b", 2], ["c", 3]], result);
});
