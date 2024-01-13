import { assertEquals as theirAssertEquals } from "https://deno.land/std@0.212.0/assert/mod.ts";
import { ParseSong } from "./parser/parser.ts";
import { type Bar } from "./parser/song.ts";
import { fail } from "https://deno.land/std@0.212.0/assert/mod.ts";
import { Result } from "./lib/result.ts";

// because expected should always be the first arg. come on deno
export function assertEquals<T>(
  expected: T,
  actual: T,
  msg?: string,
  options: { formatter?: (value: unknown) => string } = {},
) {
  return theirAssertEquals(actual, expected, msg, options);
}

export function bar(...chords: string[]): Bar {
  return parserResultOrFail(ParseSong(`| ${chords.join(" ")} |`)).bars[0]!;
}

export function barWithSection(section: string, ...chords: string[]): Bar {
  return { ...bar(...chords), name: section };
}

export function parserResultOrFail<T>(result: Result<T>): T {
  if (result.error) {
    fail(`grammar failed to match!
  failure: ${result.error.message}`);
  } else {
    return result.value;
  }
}
