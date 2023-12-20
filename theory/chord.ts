import { type Letter, transposeLetter } from "./letter.ts";
import { nonexhaustiveSwitchGuard } from "../lib/switch.ts";
import { type FlatOrSharpSymbol } from "./notation.ts";
import { type Alteration } from "./chord/alteration.ts";
import { type Extent } from "./chord/extent.ts";
import {
  Augmented,
  Diminished,
  Dominant,
  Major,
  Minor,
  MinorMajor,
  Power,
  type Quality,
  Suspended,
} from "./chord/quality.ts";
export * from "./chord/extent.ts";
export * from "./chord/quality.ts";

export class Chord {
  public type = ChordTypeName;

  public tonic: Letter;
  public quality: Quality;
  public extent?: Extent;
  public alterations: Array<Alteration>;

  constructor(
    tonic?: Letter,
    quality?: Quality,
    extent?: Extent,
    ...alterations: Array<Alteration>
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
    chord.alterations = this.alterations?.map((alt) =>
      alt.transpose(halfSteps, flatsOrSharps)
    );
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

  print(formatters?: Formatters): string {
    return `${this.tonic}${this.printFlavor(formatters)}`;
  }

  private printFlavor(formatters?: Formatters): string {
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
          const i = alterations.findIndex((a) => a.isAdd9());
          if (i >= 0) {
            alterations.splice(i, 1);
            quality = "6/9"; // we want "C6/9" instead of "C6(add 9)"
            extent = "";
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

    const printedAlterations = formatters?.alterations
      ? formatters.alterations(alterations)
      : alterations.map((a) =>
        (["add", "omit"].includes(a.kind)) ? `(${a.print()})` : a.print()
      ).join("");

    return `${quality}${extent}${printedAlterations}`;
  }
}

export const ChordTypeName = "chord" as const;

export type Formatters = {
  alterations: AlterationsFormatter;
};
export type AlterationsFormatter = (as: Alteration[]) => string;
