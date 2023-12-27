import { type Chord, type Quality } from "../../theory/chord.ts";
import {
  type ChordFormatter,
  DefaultChordFormatterInstance,
} from "../../theory/chord/formatter.ts";
import { FlatOrSharpSymbol } from "../../theory/notation.ts";

export const SongChordTypeName = "chord" as const;
export const OptionalChordTypeName = "optionalChord" as const;
export const NoChordTypeName = "noChord" as const;
export const RepeatPreviousChordTypeName = "repeatPreviousChord" as const;

export class OptionalChord {
  public type = OptionalChordTypeName;
  public chord: Chord;

  constructor(chord: Chord) {
    this.chord = chord;
  }

  dup() {
    return new OptionalChord(this.chord.dup());
  }

  transpose(halfSteps: number, flatsOrSharps: FlatOrSharpSymbol) {
    return new OptionalChord(this.chord.transpose(halfSteps, flatsOrSharps));
  }

  print(formatter: ChordFormatter = DefaultChordFormatterInstance): string {
    return `(${this.chord.print(formatter)})`;
  }
}

export class NoChord {
  public type = NoChordTypeName;

  dup() {
    return new NoChord();
  }

  print(): string {
    return "N.C.";
  }
}

export class RepeatPreviousChord {
  public type = RepeatPreviousChordTypeName;

  dup() {
    return new RepeatPreviousChord();
  }

  print(): string {
    return RepeatedChordSymbol;
  }
}

export type Chordish =
  | Chord
  | OptionalChord
  | NoChord
  | RepeatPreviousChord;

export type ChordishQuality = Quality | "no-chord";

export const RepeatedChordSymbol = "%";
export const AllRepeatedChordSymbols = [
  RepeatedChordSymbol,
  "/",
  "-",
  "𝄎",
];
