import { Flat, Major, Minor, Perfect, Sharp } from "../../interval.ts";

export const type = "triad" as const;

// The four types of triads we can build by stacking major or minor thirds.
export type TertianTriad =
  | typeof Maj
  | typeof Min
  | typeof Aug
  | typeof Dim;

export type TertianTriadID =
  | typeof Aug_id
  | typeof Dim_id
  | typeof Maj_id
  | typeof Min_id;

export const Aug_id = "aug" as const;
export const Dim_id = "dim" as const;
export const Maj_id = "maj" as const;
export const Min_id = "min" as const;

const common = { type, seventh: undefined, extent: undefined };

// Mm ♪ ←Maj3→ ♪ ←min3→ ♪ : {0 4 7}
export const Maj = { ...common, third: Major, fifth: Perfect } as const;

// mM ♪ ←min3→ ♪ ←Maj3→ ♪ : {0 3 7}
export const Min = { ...common, third: Minor, fifth: Perfect } as const;

// MM ♪ ←Maj3→ ♪ ←Maj3→ ♪ : {0 4 8}
export const Aug = { ...common, third: Major, fifth: Sharp } as const;

// mm ♪ ←min3→ ♪ ←min3→ ♪ : {0 3 6}
export const Dim = { ...common, third: Minor, fifth: Flat } as const;
