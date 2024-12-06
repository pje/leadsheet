import { assertEquals as theirAssertEquals, fail } from "@std/assert";
import { ParseSong } from "./parser/parser.ts";
import { type Bar } from "./parser/song.ts";
import { Result } from "./lib/result.ts";

// because expected should always be the first arg. come on deno
export function assertEquals<T>(
  expected: T,
  actual: T,
  msg?: string,
) {
  return theirAssertEquals(actual, expected, msg);
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
