import { FlatOrSharpSymbol } from "./types.ts";
import { conventionalizeKey, transpose } from "./utils.ts";

export type Chord = {
  tonic: Letter;
  flavor: string | undefined;
  quality: string | undefined;
  qualityClass: ChordQuality | undefined;
  extent: string | undefined;
  alterations: Array<string>;
};

export function transposeChord(
  this: Chord,
  halfSteps: number,
  flatsOrSharps: FlatOrSharpSymbol,
): Chord {
  const chord: Chord = { ...this };
  const newRoot = conventionalizeKey(
    transpose(chord.tonic, halfSteps, flatsOrSharps),
  );

  chord.tonic = newRoot;
  return chord;
}

export function printChord(this: Chord): string {
  return `${this.tonic}${this.flavor}`;
}

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

export type ChordQuality =
  | typeof QualityMajor
  | typeof QualityMinor
  | typeof QualityMinorMajor
  | typeof QualityDominant
  | typeof QualityPower
  | typeof QualitySuspended
  | typeof QualityAugmented
  | typeof QualityDiminished;

export const QualityMajor = "maj" as const;
export const QualityMinorMajor = "minmaj" as const;
export const QualityMinor = "min" as const;
export const QualityDominant = "dom" as const;
export const QualityPower = "pow" as const;
export const QualitySuspended = "sus" as const;
export const QualityAugmented = "aug" as const;
export const QualityDiminished = "dim" as const;
