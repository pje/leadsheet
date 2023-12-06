/// <reference lib="deno.ns" />
import { assertEquals as theirAssertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

// because expected should always be the first arg. come on deno
export function assertEquals<T>(
  expected: T,
  actual: T,
  msg?: string,
  options: { formatter?: (value: unknown) => string } = {},
) {
  return theirAssertEquals(actual, expected, msg, options);
}
