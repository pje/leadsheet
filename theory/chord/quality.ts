import { Extent } from "./extent.ts";

export type Quality = {
  dyad: DyadID;
  triad?: undefined;
  tetrad?: undefined;
  extent?: undefined;
} | {
  dyad?: undefined;
  triad: TertianTriadID;
  tetrad?: undefined;
  extent?: undefined;
} | {
  dyad?: undefined;
  triad: TertianTriadID;
  tetrad: "maj" | "min" | "dim";
  extent: Extent;
};

export type QualityID =
  | DyadID
  | TertianTriadID
  | TertianTetradID
  | NontertianTetradID;

// The four types of triads we can build by stacking major or minor thirds.
export type TertianTriadID =
  | typeof AugID
  | typeof DimID
  | typeof MajID
  | typeof MinID;

export const MajID = "maj" as const; // Mm ♪ ←Maj3→ ♪ ←min3→ ♪ : {0 4 7}
export const MinID = "min" as const; // mM ♪ ←min3→ ♪ ←Maj3→ ♪ : {0 3 7}
export const AugID = "aug" as const; // MM ♪ ←Maj3→ ♪ ←Maj3→ ♪ : {0 4 8}
export const DimID = "dim" as const; // mm ♪ ←min3→ ♪ ←min3→ ♪ : {0 3 6}

export const Maj = { triad: MajID };
export const Min = { triad: MinID };
export const Aug = { triad: AugID };
export const Dim = { triad: DimID };

export type Triad = typeof Maj | typeof Min | typeof Aug | typeof Dim;

export type Tetrad =
  | TertianTetrad
  | NontertianTetrad;
// The eight types of tetrads we can build by stacking major or minor thirds.
// These are all the possible "7th" chords (without alterations or extensions).
//
// Note that every tertian tetrad *is also a tertian triad*, but I don't know how
// to clearly express that with just typescript enums.
export type TertianTetrad =
  | typeof Maj7
  | typeof Dom7
  | typeof MinMaj7
  | typeof Min7
  | typeof Maj7S5
  | typeof Aug7
  | typeof Min7b5
  | typeof Dim7
  | typeof DimM7;

const Seventh: { extent: Extent } = { extent: 7 };
const MM = { triad: MajID, tetrad: MajID } as const;
const Mm = { triad: MajID, tetrad: MinID } as const;
const mM = { triad: MinID, tetrad: MajID } as const;
const mm = { triad: MinID, tetrad: MinID } as const;
const AM = { triad: AugID, tetrad: MajID } as const;
const Am = { triad: AugID, tetrad: MinID } as const;
const dm = { triad: DimID, tetrad: MinID } as const;
const dd = { triad: DimID, tetrad: DimID } as const;
const dM = { triad: DimID, tetrad: MajID } as const;

export const Maj7 = { ...MM, ...Seventh } as const; //     :  ♪ ←Maj3→ ♪ ←min3→ ♪ ←Maj3→ ♪ : {0 4 7 11}
export const Dom7 = { ...Mm, ...Seventh } as const; //     :  ♪ ←Maj3→ ♪ ←min3→ ♪ ←min3→ ♪ : {0 4 7 10}
export const MinMaj7 = { ...mM, ...Seventh } as const; //  :  ♪ ←min3→ ♪ ←Maj3→ ♪ ←Maj3→ ♪ : {0 3 7 11} (rare)
export const Min7 = { ...mm, ...Seventh } as const; //     :  ♪ ←min3→ ♪ ←Maj3→ ♪ ←min3→ ♪ : {0 3 7 10}
export const Maj7S5 = { ...AM, ...Seventh } as const; //   :  ♪ ←Maj3→ ♪ ←Maj3→ ♪ ←Maj3→ ♪ : {0 4 8 11} (a.k.a "C+M7") (rare)
export const Aug7 = { ...Am, ...Seventh } as const; //     :  ♪ ←Maj3→ ♪ ←Maj3→ ♪ ←min3→ ♪ : {0 4 8 10}
export const Min7b5 = { ...dm, ...Seventh } as const; //   :  ♪ ←min3→ ♪ ←min3→ ♪ ←Maj3→ ♪ : {0 3 6 10} (i.e. "half-diminished 7", a.k.a. "Cø7")
export const Dim7 = { ...dd, ...Seventh } as const; //     :  ♪ ←min3→ ♪ ←min3→ ♪ ←min3→ ♪ : {0 3 6  9} (i.e. "diminished 7", a.k.a. "Co7")
export const DimM7 = { ...dM, ...Seventh } as const; //    :  ♪ ←min3→ ♪ ←min3→ ♪ ←Maj3→ ♪ : {0 3 6  11} (i.e. "diminished Major 7")

export const Maj7ID = `${Maj7.triad}${Maj7.tetrad}` as const;
export const Dom7ID = `${Dom7.triad}${Dom7.tetrad}` as const;
export const MinMaj7ID = `${MinMaj7.triad}${MinMaj7.tetrad}` as const;
export const Min7ID = `${Min7.triad}${Min7.tetrad}` as const;
export const Maj7S5ID = `${Maj7S5.triad}${Maj7S5.tetrad}` as const; // a.k.a. "CM7#5", "C+M7"
export const Aug7ID = `${Aug7.triad}${Aug7.tetrad}` as const;
export const DimM7ID = `${DimM7.triad}${DimM7.tetrad}` as const;
export const MinXb5ID = `${Min7b5.triad}${Min7b5.tetrad}` as const;
export const Dim7ID = `${Dim7.triad}${Dim7.tetrad}` as const;

export type TertianTetradID =
  | typeof Maj7ID
  | typeof Dom7ID
  | typeof MinMaj7ID
  | typeof Min7ID
  | typeof Maj7S5ID
  | typeof Aug7ID
  | typeof DimM7ID
  | typeof MinXb5ID
  | typeof Dim7ID;

// Tetrads constructed by stacking intervals OTHER than thirds.
//
// Note that this is nonexhaustive
export type NontertianTetrad = // | typeof Maj6
  typeof DimM7;
// | typeof Min6
// | typeof Aug6;
export const Maj6 = "maj6" as const; //               :  ♪ ←Maj3→ ♪ ←min3→ ♪ ←M2→ ♪   {0 4 7  9} :  just a "C6"
export const Min6 = "min6" as const; //               :  ♪ ←min3→ ♪ ←Maj3→ ♪ ←M2→ ♪   {0 3 7  9} :  just a "Cm6"
export const Aug6 = `${AugID}${DimID}` as const; //   :  ♪ ←Maj3→ ♪ ←Maj3→ ♪ ←m1→ ♪   {0 4 8  9} :  "C+6", I guess? (rare) (probably more commonly described as an AmM7 at that point)

export type TetradID =
  | NontertianTetradID
  | TertianTetradID;

export type NontertianTetradID =
  | typeof Maj6
  | typeof Min6
  | typeof DimM7ID
  | typeof Aug6;

export type DyadID = typeof PowerID;
export const PowerID = "pow" as const; // a power chord (just 1 and 5)
export const Power = { dyad: PowerID };

// All the qualities where it makes sense to talk about "extent" (7|9|11|13 versions)
export type ExtendableTetradID =
  | `${typeof MajID | typeof MinID | typeof DimID | typeof AugID}${
    | typeof MajID
    | typeof MinID}`
  | typeof Dim7ID;

export type ExtendableTetrad =
  | typeof Maj7
  | typeof Dom7
  | typeof MinMaj7
  | typeof Min7
  | typeof Maj7S5
  | typeof Aug7
  | typeof DimM7
  | typeof Min7b5
  | typeof Dim7;

export type NonextendableID = Exclude<Quality, ExtendableTetradID>;

// convenience constructors for extended chords
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
