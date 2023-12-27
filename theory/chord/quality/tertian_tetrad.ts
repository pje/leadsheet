import { Diminished, Major, Minor } from "../../interval.ts";
import { type Extent } from "../extent.ts";
import { Aug7, Aug7_id, type DimM7, DimM7_id } from "./nontertian_tetrad.ts";
import { Aug, Dim, Maj, Min } from "./tertian_triad.ts";

export const type = "tetrad" as const;

// The eight types of tetrads we can build by stacking major or minor thirds.
// These are all the possible "7th" chords (without alterations or extensions).
export type TertianTetrad =
  | typeof Maj7
  | typeof Dom7
  | typeof MinMaj7
  | typeof Min7
  | typeof Maj7Sh5
  | typeof Min7Fl5
  | typeof Dim7;

const common = { type, extent: 7 as Extent };

export const Maj7 = { ...Maj, ...common, seventh: Major } as const;
export const Dom7 = { ...Maj, ...common, seventh: Minor } as const;
export const MinMaj7 = { ...Min, ...common, seventh: Major } as const;
export const Min7 = { ...Min, ...common, seventh: Minor } as const;
export const Maj7Sh5 = { ...Aug, ...common, seventh: Major } as const;
export const Min7Fl5 = { ...Dim, ...common, seventh: Minor } as const;
export const Dim7 = { ...Dim, ...common, seventh: Diminished } as const;

export type TertianTetradID =
  | typeof Maj7_id
  | typeof Dom7_id
  | typeof MinMaj7_id
  | typeof Min7_id
  | typeof Maj7Sh5_id
  | typeof Min7Fl5_id
  | typeof Dim7_id;

export const Maj7_id = "maj7" as const;
export const Dom7_id = "dom7" as const;
export const MinMaj7_id = "minmaj7" as const;
export const Min7_id = "min7" as const;
export const Maj7Sh5_id = "maj7#5" as const;
export const Min7Fl5_id = "min7b5" as const;
export const Dim7_id = "dim7" as const;

// All the qualities where it makes sense to talk about "extent" (7|9|11|13 versions)
export type ExtendableTetradID =
  | TertianTetradID
  | typeof Aug7_id
  | typeof DimM7_id;

export type ExtendableTetrad =
  | TertianTetrad
  | typeof Aug7
  | typeof DimM7;

// convenience consts for all the extensions of the most common tetrads
export const Maj9 = { ...Maj7, extent: 9 } as const;
export const Maj11 = { ...Maj7, extent: 11 } as const;
export const Maj13 = { ...Maj7, extent: 13 } as const;
export const Min9 = { ...Min7, extent: 9 } as const;
export const Min11 = { ...Min7, extent: 11 } as const;
export const Min13 = { ...Min7, extent: 13 } as const;
export const Dom9 = { ...Dom7, extent: 9 } as const;
export const Dom11 = { ...Dom7, extent: 11 } as const;
export const Dom13 = { ...Dom7, extent: 13 } as const;
export const MinMaj9 = { ...MinMaj7, extent: 9 } as const;
export const MinMaj11 = { ...MinMaj7, extent: 11 } as const;
export const MinMaj13 = { ...MinMaj7, extent: 13 } as const;
