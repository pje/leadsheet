import { FlatOrSharpSymbol } from "./types.ts";
import { nonexhaustiveSwitchGuard, transposeLetter } from "./utils.ts";

export type Chord = {
  tonic: Letter;
  quality: ChordQuality;
  extent?: string;
  alterations?: Array<string>;
};

export function transposeChord<T extends Chord>(
  this: Readonly<T>,
  halfSteps: number,
  flatsOrSharps: FlatOrSharpSymbol,
): T {
  const chord: T = { ...this };

  const newRoot = transposeLetter(chord.tonic, halfSteps, flatsOrSharps);
  chord.tonic = newRoot;

  chord.alterations = this.alterations?.map((alt) => {
    // hack: we have to transpose slash chords (the `/G` part will be the alteration)
    if (alt.startsWith("/")) {
      const slashRoot = <Letter> alt.split("/")[1];
      const transposedSlashRoot = transposeLetter(
        slashRoot,
        halfSteps,
        flatsOrSharps,
      );
      return "/" + transposedSlashRoot;
    } else {
      return alt;
    }
  });

  return chord;
}

export function printChord<T extends Chord>(this: Readonly<T>): string {
  return `${this.tonic}${flavor.bind(this)()}`;
}

function flavor(this: Readonly<Chord>): string {
  return [
    printQuality.bind(this)(),
    this.extent,
    this.alterations?.join("") || "",
  ].join("");
}

function printQuality<T extends Chord>(this: T): string {
  switch (this.quality) {
    case QualityAugmented:
      return "+";
    case QualityDiminished:
      return "o";
    case QualityDominant:
      return ""; // "dom" is implicit, `extent` defines the dominant type
    case QualityHalfDiminished:
      return "ø";
    case QualityMajor:
      if (this.extent == "6") {
        return ""; // we want "C6" instead of "CM6"
      } else if (this.extent == undefined) {
        return ""; // we want "C" instead of "CM"
      } else {
        return "M"; // we want CM9
      }
    case QualityMinor:
      return "m";
    case QualityMinorMajor:
      return "minMaj";
    case QualityPower:
      return "5";
    case QualitySuspended:
      return "sus"; // `extent` defines the suspension type
    default:
      nonexhaustiveSwitchGuard(this.quality);
  }
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
  | typeof QualityAugmented
  | typeof QualityDiminished
  | typeof QualityDominant
  | typeof QualityHalfDiminished
  | typeof QualityMajor
  | typeof QualityMinor
  | typeof QualityMinorMajor
  | typeof QualityPower
  | typeof QualitySuspended;

export const QualityAugmented = "aug" as const;
export const QualityDiminished = "dim" as const;
export const QualityDominant = "dom" as const;
export const QualityHalfDiminished = "hdim" as const;
export const QualityMajor = "maj" as const;
export const QualityMinor = "min" as const;
export const QualityMinorMajor = "minmaj" as const;
export const QualityPower = "pow" as const;
export const QualitySuspended = "sus" as const;
