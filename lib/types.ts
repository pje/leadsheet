export type Range<Arr extends number[] = []> = Arr["length"] extends 13 // max 1000: a recursion limit set by the typescript compiler
  ? Arr[number]
  : Range<[...Arr, Arr["length"]]>;

export type NaturalNumber = Range;
