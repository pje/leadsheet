import { type Letter, transposeLetter } from "./letter.ts";
import { nonexhaustiveSwitchGuard } from "../lib/switch.ts";
import { type FlatOrSharpSymbol } from "./notation.ts";

export class Chord {
  public tonic: Letter;
  public quality: Quality;
  public extent?: Extent;
  public alterations: Array<string>;

  constructor(
    tonic?: Letter,
    quality?: Quality,
    extent?: Extent,
    ...alterations: Array<string>
  ) {
    this.tonic = tonic || "C";
    this.quality = quality || Major;
    if (extent) this.extent = extent;
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
    const alterations = [...this.alterations];

    switch (this.quality) {
      case Augmented:
        quality = "+";
        break;
      case Diminished:
        quality = "o";
        break;
      case Dominant:
        quality = ""; // "dom" is implicit, `extent` defines the dominant type
        break;
      case Major:
        if (this.extent == 6) {
          const i = alterations.indexOf(Add9);
          if (i >= 0) {
            alterations.splice(i, 1);
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
      case Minor:
        quality = "m";
        break;
      case MinorMajor:
        quality = "minMaj";
        break;
      case Power:
        quality = "5";
        break;
      case Suspended:
        quality = "sus"; // `extent` defines the suspension type
        break;
      default:
        nonexhaustiveSwitchGuard(this.quality);
    }

    return `${quality}${extent}${alterations.join("")}`;
  }
}

export type Quality =
  | typeof Augmented
  | typeof Diminished
  | typeof Dominant
  | typeof Major
  | typeof Minor
  | typeof MinorMajor
  | typeof Power
  | typeof Suspended;

export const Augmented = "aug" as const;
export const Diminished = "dim" as const;
export const Dominant = "dom" as const;
export const Major = "maj" as const;
export const Minor = "min" as const;
export const MinorMajor = "minmaj" as const;
export const Power = "pow" as const;
export const Suspended = "sus" as const;

export type Extent = 2 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 13;

export const Add9 = "(add 9)" as const;
