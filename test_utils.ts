import { assertEquals as theirAssertEquals } from "https://deno.land/std@0.202.0/assert/mod.ts";
import { Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

// because expected should always be the first arg. come on deno
export function assertEquals<T>(
  expected: T,
  actual: T,
  msg?: string,
  options: { formatter?: (value: unknown) => string } = {}
) {
  return theirAssertEquals(actual, expected, msg, options);
}
