import {
  Aug7,
  Aug7_id,
  type DimM7,
  DimM7_id,
  type NontertianTetrad,
} from "./tetrad/nontertian.ts";
import { type TertianTetrad, TertianTetradID } from "./tetrad/tertian.ts";

export { type } from "./tetrad/tertian.ts";
export * from "./tetrad/tertian.ts";
export * from "./tetrad/nontertian.ts";

export type Tetrad =
  | TertianTetrad
  | NontertianTetrad;

// All the qualities where it makes sense to talk about "extent" (7|9|11|13 versions)
export type ExtendableTetradID =
  | TertianTetradID
  | typeof Aug7_id
  | typeof DimM7_id;

export type ExtendableTetrad =
  | TertianTetrad
  | typeof Aug7
  | typeof DimM7;
