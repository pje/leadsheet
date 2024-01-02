import { assertEquals } from "../../test_utils.ts";
import { normalizeAccidentals } from "../../lib/string.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";
import { HTMLFormatter } from "./html_formatter.ts";
import { assert } from "https://deno.land/std@0.91.0/_util/assert.ts";
import { CommonCases } from "./text_formatter_test.ts";

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
