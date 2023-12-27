import { Perfect } from "../../interval.ts";

export const type = "dyad" as const;

export type Dyad = typeof Power;
export type DyadID = typeof Power_id;

export const Power_id = "pow";

const common = { third: undefined, seventh: undefined, extent: undefined };

// a power chord (just 1 and 5)
export const Power = { type, ...common, fifth: Perfect } as const;
