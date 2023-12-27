import { DyadID, Power_id, type as DyadType } from "./quality/dyad.ts";
import { Diminished, Flat, Major, Minor, Perfect, Sharp } from "../interval.ts";
import {
  type NontertianTetrad,
  type NontertianTetradID,
} from "./quality/nontertian_tetrad.ts";
import {
  type ExtendableTetrad,
  type TertianTetrad,
  type TertianTetradID,
  type as TetradType,
} from "./quality/tertian_tetrad.ts";
import { type Dyad } from "./quality/dyad.ts";
import {
  Aug,
  Aug_id,
  Dim,
  Dim_id,
  Maj,
  Maj_id,
  Min,
  Min_id,
  type TertianTriad,
  type TertianTriadID,
  type as TriadType,
} from "./quality/tertian_triad.ts";
import { nonexhaustiveSwitchGuard } from "../../lib/switch.ts";

export type Quality =
  | TertianTriad
  | TertianTetrad
  | NontertianTetrad
  | Dyad;

export type QualityID =
  | DyadID
  | TertianTriadID
  | TertianTetradID
  | NontertianTetradID;

export type Triad =
  | typeof Maj
  | typeof Min
  | typeof Aug
  | typeof Dim;

export type Tetrad =
  | TertianTetrad
  | NontertianTetrad;

export type NonextendableQualities = Exclude<Quality, ExtendableTetrad>;

// export function identify(q: Readonly<Dyad>): DyadID;
// export function identify(q: Readonly<TertianTriad>): TertianTriadID;
export function identify(q: Readonly<Quality>): QualityID {
  switch (q.type) {
    case DyadType:
      return identifyDyad(q);
    case TriadType:
      return identifyTriad(q) || Maj_id;
    case TetradType:
      return humanReadable7ths[
        `${identifyTriad(q) || Maj_id}${q.seventh || Diminished}`
      ];
  }
}

export function identifyDyad(q: Readonly<Dyad>): DyadID {
  const { type } = q;

  switch (type) {
    case DyadType:
      return Power_id;
    default:
      nonexhaustiveSwitchGuard(type);
  }
}

// export function identifyTriad(
//   q: Readonly<TertianTriad>,
// ): TertianTriadID | undefined;
export function identifyTriad(
  q: Readonly<TertianTriad | TertianTetrad | NontertianTetrad>,
): TertianTriadID | undefined {
  const { type, third, fifth } = q;
  switch (type) {
    case TriadType:
    case TetradType:
      return humanReadable5ths[`${third}${fifth}`];
    default:
      nonexhaustiveSwitchGuard(type);
  }
}

type enumerated5ths = `${typeof Major | typeof Minor}${
  | typeof Flat
  | typeof Sharp
  | typeof Perfect}`;

const humanReadable5ths: {
  [K in enumerated5ths]: K extends
    `${typeof Major}${typeof Flat}` | `${typeof Minor}${typeof Sharp}`
    ? undefined
    : TertianTriadID;
} = {
  [`${Major}${Perfect}` as const]: "maj" as const,
  [`${Major}${Flat}` as const]: undefined, // totally theoretical, not used
  [`${Major}${Sharp}` as const]: "aug" as const,
  [`${Minor}${Perfect}` as const]: "min" as const,
  [`${Minor}${Flat}` as const]: "dim" as const,
  [`${Minor}${Sharp}` as const]: undefined, // totally theoretical, not used
};

type enumerated7ths = `${TertianTriadID}${
  | typeof Diminished
  | typeof Major
  | typeof Minor}`;

const humanReadable7ths: { [K in enumerated7ths]: QualityID } = {
  [`${Maj_id}${Major}` as const]: "maj7" as const,
  [`${Maj_id}${Minor}` as const]: "dom7" as const,
  [`${Maj_id}${Diminished}` as const]: "maj6" as const,
  [`${Min_id}${Major}` as const]: "minmaj7" as const,
  [`${Min_id}${Minor}` as const]: "min7" as const,
  [`${Min_id}${Diminished}` as const]: "min6" as const,
  [`${Aug_id}${Major}` as const]: "maj7#5" as const,
  [`${Aug_id}${Minor}` as const]: "7#5" as const,
  [`${Aug_id}${Diminished}` as const]: "6#5" as const, // Aug6?
  [`${Dim_id}${Major}` as const]: "dimM7" as const,
  [`${Dim_id}${Minor}` as const]: "min7b5" as const,
  [`${Dim_id}${Diminished}` as const]: "dim7" as const,
};
