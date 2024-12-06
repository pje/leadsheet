import { assertEquals } from "../../test_utils.ts";
import { normalizeAccidentals } from "../../lib/string.ts";
import { HTMLFormatter } from "./html_formatter.ts";
import { CommonCases } from "./text_formatter_test.ts";
import { assert } from "@std/assert";
import { DOMParser } from "@x/deno_dom";

Deno.test(HTMLFormatter.prototype.format.name, async (t) => {
  const cases = CommonCases;

  for (const [input, expected] of cases) {
    await t.step(
      `should format ${JSON.stringify(input)} as ${expected}`,
      () => {
        const formatted = new HTMLFormatter(input).format();
        const doc = new DOMParser().parseFromString(formatted, "text/html");
        assert(doc);
        const text = doc.textContent.trim();
        assert(text);

        const result = normalizeAccidentals(text);

        assertEquals(expected, result);
      },
    );
  }
});
