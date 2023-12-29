import { DyadID, type as DyadType } from "../theory/chord/quality/dyad.ts";
import {
  TertianTriadID,
  type as TriadType,
} from "../theory/chord/quality/triad.ts";
import { type as TetradType } from "../theory/chord/quality/tetrad.ts";
import { nonexhaustiveSwitchGuard } from "../lib/switch.ts";
import {
  Chordish,
  NoChordTypeName,
  OptionalChordTypeName,
  RepeatPreviousChord,
} from "../parser/song.ts";
import {
  AlterSuspend,
  Chord,
  ChordTypeName,
  identifyTriad,
} from "../theory/chord.ts";
import { Major, Minor } from "../theory/interval.ts";

export function colorChord(c: Readonly<Chord>): ColorClass {
  const { quality: q } = c;
  const { type } = q;

  switch (type) {
    case DyadType:
    case TriadType:
      if (c.alterations.some((a) => a.kind === AlterSuspend)) return CCSus;
      return identifyTriad(q);
    case TetradType: {
      if (q.third === Major && q.seventh === Minor) return CCDom;
      if (c.alterations.some((a) => a.kind === AlterSuspend)) return CCSus;
      return identifyTriad(q) || CCNoChord;
    }
    default:
      nonexhaustiveSwitchGuard(type);
  }
}

export function colorChordish(c: Readonly<ChordishWithoutRepeats>): ColorClass {
  const { type } = c;

  switch (type) {
    case NoChordTypeName:
      return CCNoChord;
    case OptionalChordTypeName:
      return colorChord(c.chord);
    case ChordTypeName:
      return colorChord(c);
    default:
      nonexhaustiveSwitchGuard(type);
  }
}

export type ColorClass =
  | TertianTriadID
  | DyadID
  | typeof CCDom
  | typeof CCNoChord
  | typeof CCSus;

export const CCDom = "dom" as const;
export const CCNoChord = "no-chord" as const;
export const CCSus = "sus" as const;

export type ChordishWithoutRepeats = Exclude<Chordish, RepeatPreviousChord>;
