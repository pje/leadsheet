import {
  AllLetters,
  FlatOrSharpSymbol,
  FlatSymbol,
  KeyQualifier,
  Letter,
  Major,
  Minor,
  SharpSymbol,
} from "./types.ts";
import {
  CanonicalizeKeyQualifier,
  ReplaceDupesWithRepeats,
  conventionalizeKey,
  transpose,
} from "./utils.ts";
import { assertEquals } from "./test_utils.ts";
import { DegreesToKeys, KeysToDegrees } from "./types.ts";
import { assertArrayIncludes } from "https://deno.land/std@0.202.0/assert/assert_array_includes.ts";

Deno.test(ReplaceDupesWithRepeats.name, () => {
  const input = ["CM", "CM", "CM"];
  const result = ReplaceDupesWithRepeats(input);
  assertEquals(["CM", "/", "/"], result);
});

new Map<string, KeyQualifier>([
  ["M", Major],
  ["major", Major],
  ["Major", Major],
  ["maj", Major],
  ["m", Minor],
  ["minor", Minor],
  ["Minor", Minor],
  ["min", Minor],
]).forEach((v: KeyQualifier, k: string) => {
  Deno.test(
    `${CanonicalizeKeyQualifier.name}: "${k}" should map to "${v}"`,
    () => assertEquals(v, CanonicalizeKeyQualifier(k))
  );
});

AllLetters.forEach((l: Letter) => {
  Deno.test(`Degree Maps sanity check: ${l} maps to itself`, () => {
    const result = DegreesToKeys[KeysToDegrees(l)];
    assertArrayIncludes<string>(Object.values(result), [l]);
  });
});

const cases = new Map<[Letter, number, FlatOrSharpSymbol], Letter>([
  [["A", 0, SharpSymbol], "A"],
  [["A#", 0, SharpSymbol], "A#"],
  [["Bb", 0, SharpSymbol], "Bb"],
  [["B", 0, SharpSymbol], "B"],
  [["B#", 0, SharpSymbol], "B#"],
  [["Cb", 0, SharpSymbol], "Cb"],
  [["C", 0, SharpSymbol], "C"],
  [["C#", 0, SharpSymbol], "C#"],
  [["Db", 0, SharpSymbol], "Db"],
  [["D", 0, SharpSymbol], "D"],
  [["D#", 0, SharpSymbol], "D#"],
  [["Eb", 0, SharpSymbol], "Eb"],
  [["E", 0, SharpSymbol], "E"],
  [["E#", 0, SharpSymbol], "E#"],
  [["F", 0, SharpSymbol], "F"],
  [["F#", 0, SharpSymbol], "F#"],
  [["Gb", 0, SharpSymbol], "Gb"],
  [["G", 0, SharpSymbol], "G"],
  [["G#", 0, SharpSymbol], "G#"],
  [["Ab", 0, SharpSymbol], "Ab"],

  [["A", 1, SharpSymbol], "A#"],
  [["A#", 1, SharpSymbol], "B"],
  [["Bb", 1, SharpSymbol], "B"],
  [["B", 1, SharpSymbol], "C"],
  [["B#", 1, SharpSymbol], "C#"],
  [["Cb", 1, SharpSymbol], "C"],
  [["C", 1, SharpSymbol], "C#"],
  [["C#", 1, SharpSymbol], "D"],
  [["Db", 1, SharpSymbol], "D"],
  [["D", 1, SharpSymbol], "D#"],
  [["D#", 1, SharpSymbol], "E"],
  [["Eb", 1, SharpSymbol], "E"],
  [["E", 1, SharpSymbol], "F"],
  [["E#", 1, SharpSymbol], "F#"],
  [["F", 1, SharpSymbol], "F#"],
  [["F#", 1, SharpSymbol], "G"],
  [["Gb", 1, SharpSymbol], "G"],
  [["G", 1, SharpSymbol], "G#"],
  [["G#", 1, SharpSymbol], "A"],
  [["Ab", 1, SharpSymbol], "A"],

  [["A", 1, FlatSymbol], "Bb"],
  [["A#", 1, FlatSymbol], "B"],
  [["Bb", 1, FlatSymbol], "B"],
  [["B", 1, FlatSymbol], "C"],
  [["B#", 1, FlatSymbol], "Db"],
  [["Cb", 1, FlatSymbol], "C"],
  [["C", 1, FlatSymbol], "Db"],
  [["C#", 1, FlatSymbol], "D"],
  [["Db", 1, FlatSymbol], "D"],
  [["D", 1, FlatSymbol], "Eb"],
  [["D#", 1, FlatSymbol], "E"],
  [["Eb", 1, FlatSymbol], "E"],
  [["E", 1, FlatSymbol], "F"],
  [["E#", 1, FlatSymbol], "Gb"],
  [["F", 1, FlatSymbol], "Gb"],
  [["F#", 1, FlatSymbol], "G"],
  [["Gb", 1, FlatSymbol], "G"],
  [["G", 1, FlatSymbol], "Ab"],
  [["G#", 1, FlatSymbol], "A"],
  [["Ab", 1, FlatSymbol], "A"],

  [["A", -1, SharpSymbol], "G#"],
  [["A#", -1, SharpSymbol], "A"],
  [["Bb", -1, SharpSymbol], "A"],
  [["B", -1, SharpSymbol], "A#"],
  [["B#", -1, SharpSymbol], "B"],
  [["Cb", -1, SharpSymbol], "A#"],
  [["C", -1, SharpSymbol], "B"],
  [["C#", -1, SharpSymbol], "C"],
  [["Db", -1, SharpSymbol], "C"],
  [["D", -1, SharpSymbol], "C#"],
  [["D#", -1, SharpSymbol], "D"],
  [["Eb", -1, SharpSymbol], "D"],
  [["E", -1, SharpSymbol], "D#"],
  [["E#", -1, SharpSymbol], "E"],
  [["F", -1, SharpSymbol], "E"],
  [["F#", -1, SharpSymbol], "F"],
  [["Gb", -1, SharpSymbol], "F"],
  [["G", -1, SharpSymbol], "F#"],
  [["G#", -1, SharpSymbol], "G"],
  [["Ab", -1, SharpSymbol], "G"],

  [["A", 13, FlatSymbol], "Bb"],
  [["A#", 13, FlatSymbol], "B"],
  [["Bb", 13, FlatSymbol], "B"],
  [["B", 13, FlatSymbol], "C"],
  [["B#", 13, FlatSymbol], "Db"],
  [["Cb", 13, FlatSymbol], "C"],
  [["C", 13, FlatSymbol], "Db"],
  [["C#", 13, FlatSymbol], "D"],
  [["Db", 13, FlatSymbol], "D"],
  [["D", 13, FlatSymbol], "Eb"],
  [["D#", 13, FlatSymbol], "E"],
  [["Eb", 13, FlatSymbol], "E"],
  [["E", 13, FlatSymbol], "F"],
  [["E#", 13, FlatSymbol], "Gb"],
  [["F", 13, FlatSymbol], "Gb"],
  [["F#", 13, FlatSymbol], "G"],
  [["Gb", 13, FlatSymbol], "G"],
  [["G", 13, FlatSymbol], "Ab"],
  [["G#", 13, FlatSymbol], "A"],
  [["Ab", 13, FlatSymbol], "A"],
]);
cases.forEach((v: Letter, k: [Letter, number, FlatOrSharpSymbol]) => {
  const [input, halfSteps, preferredAccidental] = k;
  Deno.test(
    `${transpose.name}: "${input}" up ${halfSteps} halfSteps (prefer ${preferredAccidental}) should be "${v}"`,
    () => assertEquals(v, transpose(input, halfSteps, preferredAccidental))
  );
});

new Map<Letter, Letter>([
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
]).forEach((v: Letter, k: Letter) => {
  Deno.test(`${conventionalizeKey.name}(${k}) should be ${v}`, () => {
    assertEquals(v, conventionalizeKey(k));
  });
});
