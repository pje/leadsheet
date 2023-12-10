import { titleCase } from "./string.ts";
import { assertEquals } from "../test_utils.ts";

Deno.test(titleCase.name, async (t) => {
  const cases = new Map<string, string>([
    ["foo bar baz", "Foo Bar Baz"],
    ["foo_bar_baz", "Foo Bar Baz"],
    ["fooBarBaz", "Foo Bar Baz"],
    ["foo", "Foo"],
    ["", ""],
  ]);

  for (const [k, v] of cases) {
    await t.step(`${titleCase.name}("${k}") should === "${v}"`, () => {
      const result = titleCase(k);
      assertEquals(v, result);
    });
  }
});
