export type Result<T> =
  | { error: undefined; value: T }
  | { error: Error; value: undefined };

export const Ok = <T>(t: T): Result<T> => {
  return { error: undefined, value: t };
};

export const Err = <E>(e: string | Error): Result<never> => {
  const error = typeof e === "string" ? new Error(e) : e;
  return { error, value: undefined };
};

export type Song = {
  title?: string;
  artist?: string;
  year?: string;
  sig?: string;
  key?: string;
  bars: Array<Bar>;
};

export const Bars = {
  "|": true,
  "||": true,
  "||:": true,
  ":||": true,
  ":1||": true,
  ":2||": true,
};

export function parseSig(song: Song): {
  numerator: string;
  denominator: string;
} {
  const [numerator, denominator] = !!song.sig
    ? song.sig.split("/")
    : ["4", "4"];

  return { numerator, denominator };
}

export function guessKey(song: Song): string {
  if (song.key) {
    return song.key;
  } else {
    const firstChord = getFirstChord(song);
    return firstChord || "?";
  }
}

function getFirstChord(song: Song): string | undefined {
  return song.bars[0].chords[0];
}

export type BarType = keyof typeof Bars;

export type Bar = {
  chords: Array<string>;
  openBar: BarType;
  closeBar: BarType;
};

export type Letter =
  | "A"
  | "A#"
  | "Bb"
  | "B"
  | "B#"
  | "Cb"
  | "C"
  | "C#"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "E#"
  | "F"
  | "F#"
  | "Gb"
  | "G"
  | "G#"
  | "Ab";

export const KeysToDegrees = new Map<Letter, number>([
  ["A", 0],
  ["A#", 1],
  ["Bb", 1],
  ["B", 2],
  ["B#", 3],
  ["Cb", 2],
  ["C", 3],
  ["C#", 4],
  ["Db", 4],
  ["D", 5],
  ["D#", 6],
  ["Eb", 6],
  ["E", 7],
  ["E#", 8],
  ["F", 8],
  ["F#", 9],
  ["Gb", 9],
  ["G", 10],
  ["G#", 11],
  ["Ab", 11],
]);

export const DegreesToKeys: Array<Letter> = [
  "A", // 0
  "Bb", // 1
  "B", // 2
  "C", // 3
  "Db", // 4
  "D", // 5
  "Eb", // 6
  "E", // 7
  "F", // 8
  "Gb", // 9
  "G", // 10
  "Ab", // 11
];

export type KeySignatureMajorLetter =
  | "C" // 0 sharps
  | "G" // 1 sharp
  | "D" // 2 sharps
  | "A" // 3 sharps
  | "E" // 4 sharps
  | "B" // 5 sharps
  | "F#" // 6 sharps
  | "C#" // 7 sharps
  | "F" // 1 flats
  | "Bb" // 2 flats
  | "Eb" // 3 flats
  | "Ab" // 4 flats
  | "Db" // 5 flats
  | "Gb" // 6 flats
  | "Cb"; // 7 flats

export type SigAccidental =
  | "F#"
  | "C#"
  | "G#"
  | "D#"
  | "A#"
  | "E#"
  | "B#"
  | "Bb"
  | "Eb"
  | "Ab"
  | "Db"
  | "Gb"
  | "Cb"
  | "Fb";

export const _0_Sharps: [] = [];
export const _1_Sharps: ["F#"] = ["F#"];
export const _2_Sharps: ["F#", "C#"] = ["F#", "C#"];
export const _3_Sharps: ["F#", "C#", "G#"] = ["F#", "C#", "G#"];
export const _4_Sharps: ["F#", "C#", "G#", "D#"] = ["F#", "C#", "G#", "D#"];
export const _5_Sharps: ["F#", "C#", "G#", "D#", "A#"] = [
  "F#",
  "C#",
  "G#",
  "D#",
  "A#",
];
export const _6_Sharps: ["F#", "C#", "G#", "D#", "A#", "E#"] = [
  "F#",
  "C#",
  "G#",
  "D#",
  "A#",
  "E#",
];
export const _7_Sharps: ["F#", "C#", "G#", "D#", "A#", "E#", "B#"] = [
  "F#",
  "C#",
  "G#",
  "D#",
  "A#",
  "E#",
  "B#",
];
export const _0_Flats = [];
export const _1_Flats: ["Bb"] = ["Bb"];
export const _2_Flats: ["Bb", "Eb"] = ["Bb", "Eb"];
export const _3_Flats: ["Bb", "Eb", "Ab"] = ["Bb", "Eb", "Ab"];
export const _4_Flats: ["Bb", "Eb", "Ab", "Db"] = ["Bb", "Eb", "Ab", "Db"];
export const _5_Flats: ["Bb", "Eb", "Ab", "Db", "Gb"] = [
  "Bb",
  "Eb",
  "Ab",
  "Db",
  "Gb",
];
export const _6_Flats: ["Bb", "Eb", "Ab", "Db", "Gb", "Cb"] = [
  "Bb",
  "Eb",
  "Ab",
  "Db",
  "Gb",
  "Cb",
];
export const _7_Flats: ["Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"] = [
  "Bb",
  "Eb",
  "Ab",
  "Db",
  "Gb",
  "Cb",
  "Fb",
];

export type AccidentalList =
  | typeof _0_Sharps
  | typeof _1_Sharps
  | typeof _2_Sharps
  | typeof _3_Sharps
  | typeof _4_Sharps
  | typeof _5_Sharps
  | typeof _6_Sharps
  | typeof _7_Sharps
  | typeof _0_Flats
  | typeof _1_Flats
  | typeof _2_Flats
  | typeof _3_Flats
  | typeof _4_Flats
  | typeof _5_Flats
  | typeof _6_Flats
  | typeof _7_Flats;

export const KeySignatureToAccidentalList = new Map<
  KeySignatureMajorLetter,
  AccidentalList
>([
  ["C", _0_Sharps],
  ["G", _1_Sharps],
  ["D", _2_Sharps],
  ["A", _3_Sharps],
  ["E", _4_Sharps],
  ["B", _5_Sharps],
  ["F#", _6_Sharps],
  ["C#", _7_Sharps],
  ["F", _1_Flats],
  ["Bb", _2_Flats],
  ["Eb", _3_Flats],
  ["Ab", _4_Flats],
  ["Db", _5_Flats],
  ["Gb", _6_Flats],
  ["Cb", _7_Flats],
]);

export const FlatSymbol = "♭";
export const SharpSymbol = "♯";

export type FlatOrSharpSymbol = typeof FlatSymbol | typeof SharpSymbol;

export const SigAccidentalToSymbol = new Map<SigAccidental, FlatOrSharpSymbol>([
  ["F#", SharpSymbol],
  ["C#", SharpSymbol],
  ["G#", SharpSymbol],
  ["D#", SharpSymbol],
  ["A#", SharpSymbol],
  ["E#", SharpSymbol],
  ["B#", SharpSymbol],
  ["Bb", FlatSymbol],
  ["Eb", FlatSymbol],
  ["Ab", FlatSymbol],
  ["Db", FlatSymbol],
  ["Gb", FlatSymbol],
  ["Cb", FlatSymbol],
  ["Fb", FlatSymbol],
]);

export const Major = "M";
export const Minor = "m";

export type KeyQualifier = typeof Major | typeof Minor;

export const RepeatedChordSymbol = "/";
