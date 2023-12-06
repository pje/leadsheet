import { FlatOrSharpSymbol } from "./types.ts";
import { nonexhaustiveSwitchGuard, transposeLetter } from "./utils.ts";

export class Chord {
  public tonic: Letter;
  public quality: ChordQuality;
  public extent?: Extent;
  public alterations?: Array<string>;

  constructor(
    tonic: Letter,
    quality: ChordQuality,
    extent?: Extent,
    ...alterations: Array<string>
  ) {
    this.tonic = tonic;
    this.quality = quality;
    this.extent = extent;
    this.alterations = alterations;
  }

  // return a new Chord that's been transposed up (or down) by `halfSteps`.
  //
  // `flatsOrSharps` will be used to choose between equivalent enharmonic
  // spellings. (if `♭`, you'll get "Ab", not "G#")
  transpose(halfSteps: number, flatsOrSharps: FlatOrSharpSymbol): Chord {
    const chord = this.dup();

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

  // returns a new Chord, value-identical to this one
  dup(): Chord {
    return new Chord(
      this.tonic,
      this.quality,
      this.extent,
      ...(this.alterations || []),
    );
  }

  print(): string {
    return `${this.tonic}${this.flavor()}`;
  }

  private flavor(): string {
    return [
      this.printQuality(),
      this.extent,
      this.alterations?.join("") || "",
    ].join("");
  }

  private printQuality(): string {
    switch (this.quality) {
      case QualityAugmented:
        return "+";
      case QualityDiminished:
        return "o";
      case QualityDominant:
        return ""; // "dom" is implicit, `extent` defines the dominant type
      case QualityMajor:
        if (this.extent == 6) {
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
  | typeof QualityMajor
  | typeof QualityMinor
  | typeof QualityMinorMajor
  | typeof QualityPower
  | typeof QualitySuspended;

export const QualityAugmented = "aug" as const;
export const QualityDiminished = "dim" as const;
export const QualityDominant = "dom" as const;
export const QualityMajor = "maj" as const;
export const QualityMinor = "min" as const;
export const QualityMinorMajor = "minmaj" as const;
export const QualityPower = "pow" as const;
export const QualitySuspended = "sus" as const;

export type Extent = 2 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 13;
