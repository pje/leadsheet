import { Major, Minor } from "../../interval.ts";
import { Extent } from "../extent.ts";
import { Aug, Dim, Maj, Min } from "./tertian_triad.ts";

export const type = "tetrad" as const;

// Tetrads constructed by stacking intervals OTHER than thirds.
//
// (nonexhaustive)
export type NontertianTetrad =
  | typeof DimM7
  | typeof Aug7
  | typeof Maj6
  | typeof Min6
  | typeof Aug6;

export type NontertianTetradID =
  | typeof DimM7_id
  | typeof Aug7_id
  | typeof Maj6_id
  | typeof Min6_id
  | typeof Aug6_id;

export const DimM7_id = `dimM7` as const;
export const Aug7_id = `7#5` as const;
export const Maj6_id = `maj6` as const;
export const Min6_id = `min6` as const;
export const Aug6_id = `6#5` as const;

const common = { type, extent: 7 as Extent };

export const DimM7 = { ...Dim, ...common, seventh: Major } as const;
export const Aug7 = { ...Aug, ...common, seventh: Minor } as const;
export const Maj6 = { ...Maj, ...common, seventh: undefined } as const;
export const Min6 = { ...Min, ...common, seventh: undefined } as const;
export const Aug6 = { ...Aug, ...common, seventh: undefined } as const;
