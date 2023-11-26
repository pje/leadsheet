import { NoteRegex } from "./utils.ts";

export type Result<T> =
  | { error: undefined; value: T }
  | { error: Error; value: undefined };

export const Ok = <T>(t: T): Result<T> => {
  return { error: undefined, value: t };
};

export const Err = (e: string | Error): Result<never> => {
  const error = typeof e === "string" ? new Error(e) : e;
  return { error, value: undefined };
};

export type Song = {
  title: string | undefined;
  artist: string | undefined;
  year: string | undefined;
  sig: string | undefined;
  key: string | undefined;
  bars: Array<Bar>;
};

export type Chord = {
  _raw: string;
  tonic: Letter;
  flavor: string | undefined;
  quality: string | undefined;
  qualityClass: ChordQuality | undefined;
  extent: string | undefined;
  alterations: Array<string>;
};

export function parseSig(song: Song): {
  numerator: string;
  denominator: string;
} {
  let [numerator, denominator] = (song.sig || "").split("/");
  if (!numerator || !denominator) {
    numerator = "4";
    denominator = "4";
  }
  return { numerator, denominator };
}

export function guessKey(song: Song): string {
  return song.key || getFirstChord(song) || "?";
}

function getFirstChord(song: Song): string {
  return song.bars![0]!.chords[0]!._raw;
}

export type Bar = {
  chords: Array<Chord>;
  openBar: string;
  closeBar: string;
};

export const AllDegrees = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
export type Degree = (typeof AllDegrees)[number];

export const AllLetters = [
  "A",
  "A#",
  "Bb",
  "B",
  "B#",
  "Cb",
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "E#",
  "Fb",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
] as const;

export type Letter = (typeof AllLetters)[number];

export function KeysToDegrees(key: Letter): Degree {
  switch (key) {
    case "A":
      return 0;
    case "A#":
    case "Bb":
      return 1;
    case "B":
    case "Cb":
      return 2;
    case "B#":
    case "C":
      return 3;
    case "C#":
    case "Db":
      return 4;
    case "D":
      return 5;
    case "D#":
    case "Eb":
      return 6;
    case "E":
    case "Fb":
      return 7;
    case "E#":
    case "F":
      return 8;
    case "F#":
    case "Gb":
      return 9;
    case "G":
      return 10;
    case "G#":
    case "Ab":
      return 11;
    default:
      // just here to get static exhaustiveness checking (TS 5.x)
      // if we add another value to Letter, we will start getting compile-time errors here
      _nonexhaustiveSwitchGuard(key);
  }
}

function _nonexhaustiveSwitchGuard(_: never): never {
  throw new Error("Switch statement was non-exhaustive");
}

export type KeyDescription =
  | {
    natural?: undefined;
    spelledWithOneFlat: Letter;
    spelledWithOneSharp: Letter;
  }
  | {
    natural: Letter;
    spelledWithOneFlat?: undefined;
    spelledWithOneSharp: Letter;
  }
  | {
    natural: Letter;
    spelledWithOneFlat: Letter;
    spelledWithOneSharp?: undefined;
  }
  | {
    natural: Letter;
    spelledWithOneFlat?: undefined;
    spelledWithOneSharp?: undefined;
  };

export const DegreesToKeys: [
  KeyDescription,
  KeyDescription,
  KeyDescription,
  KeyDescription,
  KeyDescription,
  KeyDescription,
  KeyDescription,
  KeyDescription,
  KeyDescription,
  KeyDescription,
  KeyDescription,
  KeyDescription,
] = [
  { natural: "A" }, // 0
  { spelledWithOneSharp: "A#", spelledWithOneFlat: "Bb" }, // 1
  { natural: "B", spelledWithOneFlat: "Cb" }, // 2
  { natural: "C", spelledWithOneSharp: "B#" }, // 3
  { spelledWithOneSharp: "C#", spelledWithOneFlat: "Db" }, // 4
  { natural: "D" }, // 5
  { spelledWithOneSharp: "D#", spelledWithOneFlat: "Eb" }, // 6
  { natural: "E", spelledWithOneFlat: "Fb" }, // 7
  { natural: "F", spelledWithOneSharp: "E#" }, // 8
  { spelledWithOneSharp: "F#", spelledWithOneFlat: "Gb" }, // 9
  { natural: "G" }, // 10
  { spelledWithOneSharp: "G#", spelledWithOneFlat: "Ab" }, // 11
];

export type KeySignatureMajorLetter = Extract<
  Letter,
  | "C" // 0 sharps
  | "G" // 1 sharp
  | "D" // 2 sharps
  | "A" // 3 sharps
  | "E" // 4 sharps
  | "B" // 5 sharps
  | "F#" // 6 sharps
  | "F" // 1 flats
  | "Bb" // 2 flats
  | "Eb" // 3 flats
  | "Ab" // 4 flats
  | "Db" // 5 flats
  | "Gb" // 6 flats
>;

export type SigAccidental = Extract<
  Letter,
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
  | "Fb"
>;

export const _0_Sharps = [] as const;
export const _1_Sharps = ["F#"] as const;
export const _2_Sharps = [..._1_Sharps, "C#"] as const;
export const _3_Sharps = [..._2_Sharps, "G#"] as const;
export const _4_Sharps = [..._3_Sharps, "D#"] as const;
export const _5_Sharps = [..._4_Sharps, "A#"] as const;
export const _6_Sharps = [..._5_Sharps, "E#"] as const;
export const _0_Flats = [] as const;
export const _1_Flats = ["Bb"] as const;
export const _2_Flats = [..._1_Flats, "Eb"] as const;
export const _3_Flats = [..._2_Flats, "Ab"] as const;
export const _4_Flats = [..._3_Flats, "Db"] as const;
export const _5_Flats = [..._4_Flats, "Gb"] as const;
export const _6_Flats = [..._5_Flats, "Cb"] as const;

export type AccidentalList =
  | typeof _0_Sharps
  | typeof _1_Sharps
  | typeof _2_Sharps
  | typeof _3_Sharps
  | typeof _4_Sharps
  | typeof _5_Sharps
  | typeof _6_Sharps
  | typeof _0_Flats
  | typeof _1_Flats
  | typeof _2_Flats
  | typeof _3_Flats
  | typeof _4_Flats
  | typeof _5_Flats
  | typeof _6_Flats;

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
  ["F", _1_Flats],
  ["Bb", _2_Flats],
  ["Eb", _3_Flats],
  ["Ab", _4_Flats],
  ["Db", _5_Flats],
  ["Gb", _6_Flats],
]);

export const FlatSymbol = "♭" as const;
export const SharpSymbol = "♯" as const;

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

export const ConventionallyFlatKeyDegrees = [
  // 0, // A
  1, // Bb
  // 2, // "B"
  // 3, // "C"
  4, // Db
  // 5, // "D"
  6, // Eb
  // 7, // "E"
  8, // "F"
  // 9, // "Gb"
  // 10, // "G"
  11, // Ab
];

export const RepeatedChordSymbol = "%";
export const AllRepeatedChordSymbols = [
  RepeatedChordSymbol,
  "/",
  "-",
  "𝄎",
];

export type ChordQuality =
  | typeof QualityMajor
  | typeof QualityMinor
  | typeof QualityMinorMajor
  | typeof QualityDominant
  | typeof QualityPower
  | typeof QualitySuspended
  | typeof QualityAugmented
  | typeof QualityDiminished;

export const QualityMajor = "maj" as const;
export const QualityMinorMajor = "minmaj" as const;
export const QualityMinor = "min" as const;
export const QualityDominant = "dom" as const;
export const QualityPower = "pow" as const;
export const QualitySuspended = "sus" as const;
export const QualityAugmented = "aug" as const;
export const QualityDiminished = "dim" as const;

export type Ionian = "ionian";
export type Dorian = "dorian";
export type Phyrgian = "phyrgian";
export type Lydian = "lydian";
export type Mixolydian = "mixolydian";
export type Aeolian = "aeolian";
export type Locrian = "locrian";
export type Mode =
  | Ionian
  | Dorian
  | Phyrgian
  | Lydian
  | Mixolydian
  | Aeolian
  | Locrian;

export type KeyFlavorMajor = "major";
export type KeyFlavorMinor = "minor";

export type KeyFlavor = KeyFlavorMajor | Mode;

export type Key = {
  tonic: Letter;
  flavor: KeyFlavor;
};

export function KeyFromString(s: string): Key | undefined {
  const matches = s.match(NoteRegex);
  if (matches?.groups && matches?.groups[0] && matches?.groups[1]) {
    return ({
      tonic: matches.groups[0] as Letter,
      flavor: matches.groups[1] as KeyFlavor,
    });
  } else {
    return undefined;
  }
}
