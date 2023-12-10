import { nonexhaustiveSwitchGuard } from "../lib/switch.ts";
import { type PitchClass, transposePitchClass } from "./pitch_class.ts";
import { type FlatOrSharpSymbol, FlatSymbol, SharpSymbol } from "./notation.ts";

export const AllLetters = [
  "A",
  "A#",
  "Bb",
  "B",
  "B#",
  "Cb",
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "E#",
  "Fb",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
] as const;

export type Letter = (typeof AllLetters)[number];

export function LetterToPitchClass(key: Letter): PitchClass {
  switch (key) {
    case "B#":
    case "C":
      return 0;
    case "Db":
    case "C#":
      return 1;
    case "D":
      return 2;
    case "Eb":
    case "D#":
      return 3;
    case "E":
    case "Fb":
      return 4;
    case "E#":
    case "F":
      return 5;
    case "Gb":
    case "F#":
      return 6;
    case "G":
      return 7;
    case "Ab":
    case "G#":
      return 8;
    case "A":
      return 9;
    case "Bb":
    case "A#":
      return 10;
    case "Cb":
    case "B":
      return 11;
    default:
      // just here to get static exhaustiveness checking (TS 5.x)
      // if we add another value to Letter, we will start getting compile-time errors here
      nonexhaustiveSwitchGuard(key);
  }
}

export function transposeLetter(
  noteName: Letter,
  halfSteps: number,
  preferredAccidental: FlatOrSharpSymbol = SharpSymbol,
): Letter {
  if (halfSteps == 0) return noteName;

  const currentPitchClass = LetterToPitchClass(noteName)!;
  const newPitchClass = transposePitchClass(currentPitchClass, halfSteps);
  const [natural, flat, sharp] = GetLettersForPitchClass[newPitchClass]!;

  if (natural) return natural;

  return preferredAccidental == FlatSymbol ? flat : sharp;
}

export type LetterSpelledWithOneSharp =
  | "A#"
  | "B#"
  | "C#"
  | "D#"
  | "E#"
  | "F#"
  | "G#";

export type LetterSpelledWithOneFlat =
  | "Ab"
  | "Bb"
  | "Cb"
  | "Db"
  | "Eb"
  | "Fb"
  | "Gb";

export type LetterSpelledOnlyNatural = "G" | "D" | "A";

export const GetLettersForPitchClass = {
  0: ["C", undefined, "B#"],
  1: [undefined, "Db", "C#"],
  2: ["D", undefined, undefined],
  3: [undefined, "Eb", "D#"],
  4: ["E", "Fb", undefined],
  5: ["F", undefined, "E#"],
  6: [undefined, "Gb", "F#"],
  7: ["G", undefined, undefined],
  8: [undefined, "Ab", "G#"],
  9: ["A", undefined, undefined],
  10: [undefined, "Bb", "A#"],
  11: ["B", "Cb", undefined],
} as const;
