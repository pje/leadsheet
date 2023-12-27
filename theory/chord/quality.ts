import { Diminished, Flat, Major, Minor, Perfect, Sharp } from "../interval.ts";
import {
  type Dyad,
  DyadID,
  Power_id,
  type as DyadType,
} from "./quality/dyad.ts";
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
} from "./quality/triad.ts";
import {
  Aug7_id,
  Dim7_id,
  DimM7_id,
  Dom7_id,
  type ExtendableTetrad,
  Maj6_id,
  Maj6Sh5_id,
  Maj7_id,
  Maj7Sh5_id,
  Min6_id,
  Min7_id,
  Min7Fl5_id,
  MinMaj7_id,
  type NontertianTetrad,
  type NontertianTetradID,
  type TertianTetrad,
  type TertianTetradID,
  type as TetradType,
} from "./quality/tetrad.ts";
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

const humanReadable5ths: Record<enumerated5ths, undefined | TertianTriadID> = {
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

const humanReadable7ths: Record<enumerated7ths, QualityID> = {
  [`${Maj_id}${Major}` as const]: Maj7_id,
  [`${Maj_id}${Minor}` as const]: Dom7_id,
  [`${Maj_id}${Diminished}` as const]: Maj6_id,
  [`${Min_id}${Major}` as const]: MinMaj7_id,
  [`${Min_id}${Minor}` as const]: Min7_id,
  [`${Min_id}${Diminished}` as const]: Min6_id,
  [`${Aug_id}${Major}` as const]: Maj7Sh5_id,
  [`${Aug_id}${Minor}` as const]: Aug7_id,
  [`${Aug_id}${Diminished}` as const]: Maj6Sh5_id,
  [`${Dim_id}${Major}` as const]: DimM7_id,
  [`${Dim_id}${Minor}` as const]: Min7Fl5_id,
  [`${Dim_id}${Diminished}` as const]: Dim7_id,
};
