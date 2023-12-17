import { type PitchClass, transposePitchClass } from "./pitch_class.ts";
import { type FlatOrSharpSymbol, FlatSymbol, SharpSymbol } from "./notation.ts";

type AthroughG = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type Letter = `${AthroughG}${"" | "#" | "b"}`;

export const LetterToPitchClass: Record<Letter, PitchClass> = {
  "B#": 0,
  "C": 0,
  "Db": 1,
  "C#": 1,
  "D": 2,
  "Eb": 3,
  "D#": 3,
  "E": 4,
  "Fb": 4,
  "E#": 5,
  "F": 5,
  "Gb": 6,
  "F#": 6,
  "G": 7,
  "Ab": 8,
  "G#": 8,
  "A": 9,
  "Bb": 10,
  "A#": 10,
  "Cb": 11,
  "B": 11,
};

export function transposeLetter(
  noteName: Letter,
  halfSteps: number,
  preferredAccidental: FlatOrSharpSymbol = SharpSymbol,
): Letter {
  if (halfSteps == 0) return noteName;

  const currentPitchClass = LetterToPitchClass[noteName];
  const newPitchClass = transposePitchClass(currentPitchClass, halfSteps);
  const [natural, flat, sharp] = LettersForPitchClass[newPitchClass]!;

  if (natural) return natural;

  return preferredAccidental == FlatSymbol ? flat : sharp;
}

export const LettersForPitchClass = {
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
