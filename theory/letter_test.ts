import { assertArrayIncludes } from "https://deno.land/std@0.208.0/assert/assert_array_includes.ts";
import {
  AllLetters,
  type Letter,
  LettersForPitchClass,
  LetterToPitchClass,
  transposeLetter,
} from "./letter.ts";
import { assertEquals } from "../test_utils.ts";
import { type FlatOrSharpSymbol, FlatSymbol, SharpSymbol } from "./notation.ts";

Deno.test(transposeLetter.name, async (t) => {
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

  for (const [k, v] of cases) {
    const [input, halfSteps, preferredAccidental] = k;
    await t.step(
      `"${input}" up ${halfSteps} halfSteps (prefer ${preferredAccidental}) should be "${v}"`,
      () =>
        assertEquals(v, transposeLetter(input, halfSteps, preferredAccidental)),
    );
  }
});

Deno.test(`${LettersForPitchClass} sanity checks`, async (t) => {
  for (const l of AllLetters) {
    await t.step(`${l} maps to itself`, () => {
      const result = LettersForPitchClass[LetterToPitchClass(l)];
      assertArrayIncludes<string>(<Array<string>> Object.values(result), [l]);
    });
  }
});
