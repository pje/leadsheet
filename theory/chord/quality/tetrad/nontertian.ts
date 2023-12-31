import { Major, Minor } from "../../../interval.ts";
import { Extent } from "../../extent.ts";
import { Aug, Dim, Maj, Min } from "../triad.ts";
import { type } from "./tertian.ts";

// Tetrads constructed by stacking intervals OTHER than thirds.
//
// (nonexhaustive)
export type NontertianTetrad =
  | typeof DimM7
  | typeof Aug7
  | typeof Maj6
  | typeof Min6
  | typeof Maj6Sh5;

export type NontertianTetradID =
  | typeof DimM7_id
  | typeof Aug7_id
  | typeof Maj6_id
  | typeof Min6_id
  | typeof Maj6Sh5_id
  | typeof Maj69_id
  | typeof Min69_id;

export const DimM7_id = `dimM7` as const;
export const Aug7_id = `7#5` as const;
export const Maj6_id = `maj6` as const;
export const Min6_id = `min6` as const;
export const Maj6Sh5_id = `6#5` as const;
export const Maj69_id = `maj6/9` as const;
export const Min69_id = `min6/9` as const;

const common = { type, extent: 7 as Extent };

export const DimM7 = { ...Dim, ...common, seventh: Major } as const;
export const Aug7 = { ...Aug, ...common, seventh: Minor } as const;
export const Maj6 = { ...Maj, type, sixth: Major } as const;
export const Min6 = { ...Min, type, sixth: Major } as const;
export const Maj6Sh5 = { ...Aug, type, sixth: Major } as const;
export const Maj69 = { ...Maj, type, sixth: Major, ninth: Major } as const;
export const Min69 = { ...Min, type, sixth: Major, ninth: Major } as const;
