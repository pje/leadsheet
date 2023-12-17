import { assertEquals } from "../test_utils.ts";
import { unicodeifyMusicalSymbols } from "./utils.ts";

Deno.test(unicodeifyMusicalSymbols.name, async (t) => {
  await t.step(`should transform all accidentals`, () => {
    const input = "A#7#9#5";

    const result = unicodeifyMusicalSymbols(input);
    const expectedCount = 3;
    const count = result.split("").filter((e) => e === "♯").length;
    assertEquals(
      expectedCount,
      count,
      `expected "${input}" to transform ${expectedCount} accidentals, but it transformed ${count}: ${result}`,
    );
  });
});
