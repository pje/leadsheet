import {
  canonicalizeKeyQualifier,
  conventionalizeKey,
  type KeyQualifier,
  Major,
  Minor,
} from "./key.ts";
import { type Letter } from "./letter.ts";
import { assertEquals } from "../test_utils.ts";

Deno.test(canonicalizeKeyQualifier.name, async (t) => {
  const cases = new Map<string, KeyQualifier>([
    ["", Major],
    ["M", Major],
    ["major", Major],
    ["Major", Major],
    ["maj", Major],
    ["m", Minor],
    ["minor", Minor],
    ["Minor", Minor],
    ["min", Minor],
  ]);
  for (const [k, v] of cases) {
    await t.step(
      `"${k}" ⇒ "${v}"`,
      () => assertEquals(v, canonicalizeKeyQualifier(k)),
    );
  }
});

Deno.test(conventionalizeKey.name, async (t) => {
  const cases = new Map<Letter, Letter>([
    ["A", "A"],
    ["A#", "Bb"],
    ["Bb", "Bb"],
    ["B", "B"],
    ["B#", "C"],
    ["Cb", "B"],
    ["C", "C"],
    ["C#", "Db"],
    ["Db", "Db"],
    ["D", "D"],
    ["D#", "Eb"],
    ["Eb", "Eb"],
    ["E", "E"],
    ["E#", "F"],
    ["Fb", "E"],
    ["F", "F"],
    ["F#", "F#"], // ambiguous
    ["Gb", "Gb"], // ambiguous
    ["G", "G"],
    ["G#", "Ab"],
    ["Ab", "Ab"],
  ]);

  for (const [k, v] of cases) {
    await t.step(`${k} ⇒ ${v}`, () => {
      assertEquals(v, conventionalizeKey(k));
    });
  }
});
