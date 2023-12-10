export const FlatSymbol = "♭" as const;
export const SharpSymbol = "♯" as const;
export type FlatOrSharpSymbol = typeof FlatSymbol | typeof SharpSymbol;

export const RepeatedChordSymbol = "%";
export const AllRepeatedChordSymbols = [
  RepeatedChordSymbol,
  "/",
  "-",
  "𝄎",
];

export type BarlineClass =
  | "barline-single-open"
  | "barline-single-close"
  | "barline-double-open"
  | "barline-double-close"
  | "barline-repeat-open"
  | "barline-repeat-close";
