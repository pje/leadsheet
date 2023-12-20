export type Quality =
  | typeof Augmented
  | typeof Diminished
  | typeof Dominant
  | typeof Major
  | typeof Minor
  | typeof MinorMajor
  | typeof Power
  | typeof Suspended;

export const Augmented = "aug" as const;
export const Diminished = "dim" as const;
export const Dominant = "dom" as const;
export const Major = "maj" as const;
export const Minor = "min" as const;
export const MinorMajor = "minmaj" as const;
export const Power = "pow" as const;
export const Suspended = "sus" as const;
