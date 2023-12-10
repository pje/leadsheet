import { FlatOrSharpSymbol } from "./types.ts";
import { nonexhaustiveSwitchGuard, transposeLetter } from "./utils.ts";

export class Chord {
  public tonic: Letter;
  public quality: ChordQuality;
  public extent?: Extent;
  public alterations: Array<string>;

  constructor(
    tonic?: Letter,
    quality?: ChordQuality,
    extent?: Extent,
    ...alterations: Array<string>
  ) {
    this.tonic = tonic || "C";
    this.quality = quality || QualityMajor;
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
    return `${this.tonic}${this.printFlavor()}`;
  }

  private printFlavor(): string {
    let extent = this.extent || "";
    let quality = "";

    switch (this.quality) {
      case QualityAugmented:
        quality = "+";
        break;
      case QualityDiminished:
        quality = "o";
        break;
      case QualityDominant:
        quality = ""; // "dom" is implicit, `extent` defines the dominant type
        break;
      case QualityMajor:
        if (this.extent == 6) {
          const i = this.alterations.indexOf(Add9);
          if (i >= 0) {
            this.alterations.splice(i, 1);
            quality = "";
            extent = "6/9"; // we want "C6/9" instead of "C6(add 9)"
          } else {
            quality = ""; // we want "C6" instead of "CM6"
          }
        } else if (!this.extent) {
          quality = ""; // we want "C" instead of "CM"
        } else {
          quality = "M"; // we want CM9
        }
        break;
      case QualityMinor:
        quality = "m";
        break;
      case QualityMinorMajor:
        quality = "minMaj";
        break;
      case QualityPower:
        quality = "5";
        break;
      case QualitySuspended:
        quality = "sus"; // `extent` defines the suspension type
        break;
      default:
        nonexhaustiveSwitchGuard(this.quality);
    }

    const alterations = this.alterations?.join("") || "";
    return `${quality}${extent}${alterations}`;
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

export const Add9 = "(add 9)" as const;
