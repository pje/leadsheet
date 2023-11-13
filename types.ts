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

export const RepeatedChordSymbol = "/";
