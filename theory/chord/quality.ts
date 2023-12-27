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
  Maj6_id,
  Maj6Sh5,
  Maj6Sh5_id,
  Maj7,
  Maj7_id,
  Maj7Sh5,
  Maj7Sh5_id,
  Min6,
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
import { omit, pick } from "../../lib/object.ts";

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
  const result = match(q)
    .returnType<QualityID>()
    .with(Power, () => Power_id)
    .with(Maj, () => Maj_id)
    .with(Min, () => Min_id)
    .with(Aug, () => Aug_id)
    .with(Dim, () => Dim_id)
    .with(omit(Maj7, "extent"), () => Maj7_id)
    .with(omit(Dom7, "extent"), () => Dom7_id)
    .with(omit(MinMaj7, "extent"), () => MinMaj7_id)
    .with(omit(Min7, "extent"), () => Min7_id)
    .with(omit(Maj7Sh5, "extent"), () => Maj7Sh5_id)
    .with(omit(Min7Fl5, "extent"), () => Min7Fl5_id)
    .with(omit(Dim7, "extent"), () => Dim7_id)
    .with(omit(DimM7, "extent"), () => DimM7_id)
    .with(omit(Aug7, "extent"), () => Aug7_id)
    .with(Maj6, () => Maj6_id)
    .with(Min6, () => Min6_id)
    .with(Maj6Sh5, () => Maj6Sh5_id)
    .exhaustive();

  return result;
}

export function identifyTriad(q: Readonly<Quality>): TertianTriadID | DyadID {
  const result = match(q)
    .returnType<TertianTriadID | DyadID>()
    .with(pick(Power, "third", "fifth", "seventh"), () => Power_id)
    .with(pick(Maj, "third", "fifth"), () => Maj_id)
    .with(pick(Min, "third", "fifth"), () => Min_id)
    .with(pick(Aug, "third", "fifth"), () => Aug_id)
    .with(pick(Dim, "third", "fifth"), () => Dim_id)
    .exhaustive();

  return result;
}
