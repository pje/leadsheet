import { assertEquals as theirAssertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ParseChord } from "./parser/parser.ts";
import { type Bar } from "./parser/song.ts";

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
  return {
    ..._emptyBar,
    chords: chords.map((str: string) =>
      str === "N.C." ? str : ParseChord(str).value!
    ),
  };
}

export function barWithSection(section: string, ...chords: string[]): Bar {
  return { ...bar(...chords), name: section };
}

const _emptyBar: Bar = {
  chords: [],
  openBarline: "|",
  closeBarline: "|",
  name: undefined,
};
