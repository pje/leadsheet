import { type Letter, transposeLetter } from "./letter.ts";
import { type FlatOrSharpSymbol } from "./notation.ts";
import { type Alteration } from "./chord/alteration.ts";
import { type Quality } from "./chord/quality.ts";
import { Maj } from "./chord/quality/tertian_triad.ts";
export * from "./chord/alteration.ts";
export * from "./chord/extent.ts";
export * from "./chord/quality.ts";

export class Chord {
  public type = ChordTypeName;

  public tonic: Letter;
  public quality: Quality;
  public alterations: Array<Alteration>;

  constructor(
    tonic?: Letter,
    quality?: Quality,
    ...alterations: Array<Alteration>
  ) {
    this.tonic = tonic || "C";
    this.quality = quality || Maj;
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
      ...(this.alterations),
    );
  }

  print(formatter: Formatter): string {
    return formatter.format(this);
  }
}

export const ChordTypeName = "chord" as const;

type Formatter = {
  format(c: Chord): string;
};
