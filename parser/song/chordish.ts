import {
  type Chord,
  type Quality,
  rehydrate as rehydrateChord,
} from "../../theory/chord.ts";
import { type ChordFormatter } from "../../formatter/chord_formatter.ts";
import { DefaultChordFormatterInstance } from "../../formatter/chord/text_formatter.ts";
import { FlatOrSharpSymbol } from "../../theory/notation.ts";
import { nonexhaustiveSwitchGuard } from "../../lib/switch.ts";

export type Chordish =
  | Chord
  | OptionalChord
  | NoChord
  | RepeatPreviousChord;

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

export function rehydrate(c: Chordish): Chordish {
  const { type } = c;
  switch (type) {
    case "chord":
      return rehydrateChord(c);
    case "optionalChord":
      c.chord = rehydrateChord(c.chord);
      return Object.assign(new OptionalChord(c.chord), c);
    case "noChord":
      return Object.assign(new NoChord(), c);
    case "repeatPreviousChord":
      return Object.assign(new RepeatPreviousChord(), c);
    default:
      nonexhaustiveSwitchGuard(type);
  }
}

export type ChordishQuality = Quality | "no-chord";

export const RepeatedChordSymbol = "%";
export const AllRepeatedChordSymbols = [
  RepeatedChordSymbol,
  "/",
  "-",
  "𝄎",
];
