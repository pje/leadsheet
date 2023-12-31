// @deno-types="../../node_modules/ts-pattern/dist/index.d.ts"
import { match } from "../../node_modules/ts-pattern/dist/index.js";

import { type Dyad, DyadID, Power, Power_id } from "./quality/dyad.ts";
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
} from "./quality/triad.ts";
import {
  Aug7,
  Aug7_id,
  Dim7,
  Dim7_id,
  DimM7,
  DimM7_id,
  Dom7,
  Dom7_id,
  type ExtendableTetrad,
  Maj6,
  Maj69,
  Maj69_id,
  Maj6_id,
  Maj6Sh5,
  Maj6Sh5_id,
  Maj7,
  Maj7_id,
  Maj7Sh5,
  Maj7Sh5_id,
  Min6,
  Min69,
  Min69_id,
  Min6_id,
  Min7,
  Min7_id,
  Min7Fl5,
  Min7Fl5_id,
  MinMaj7,
  MinMaj7_id,
  type NontertianTetrad,
  type NontertianTetradID,
  type TertianTetrad,
  type TertianTetradID,
} from "./quality/tetrad.ts";
import { pick } from "../../lib/object.ts";

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

export function identifyTriad(q: Readonly<Quality>): TertianTriadID | DyadID {
  const result = match(q)
    .returnType<TertianTriadID | DyadID>()
    .with(pick(Maj, "third", "fifth"), () => Maj_id)
    .with(pick(Min, "third", "fifth"), () => Min_id)
    .with(pick(Aug, "third", "fifth"), () => Aug_id)
    .with(pick(Dim, "third", "fifth"), () => Dim_id)
    .with(pick(Power, "fifth"), () => Power_id)
    .exhaustive();

  return result;
}

export const QualityIdToQuality: { [K in QualityID]: Quality } = {
  [Maj_id]: Maj,
  [Min_id]: Min,
  [Aug_id]: Aug,
  [Dim_id]: Dim,
  [Power_id]: Power,
  [Maj6_id]: Maj6,
  [Min6_id]: Min6,
  [Maj69_id]: Maj69,
  [Min69_id]: Min69,
  [Dom7_id]: Dom7,
  [Maj7_id]: Maj7,
  [MinMaj7_id]: MinMaj7,
  [Min7_id]: Min7,
  [Maj7Sh5_id]: Maj7Sh5,
  [Min7Fl5_id]: Min7Fl5,
  [Dim7_id]: Dim7,
  [DimM7_id]: DimM7,
  [Aug7_id]: Aug7,
  [Maj6Sh5_id]: Maj6Sh5,
};
