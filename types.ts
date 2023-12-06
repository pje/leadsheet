import { Letter } from "./chord.ts";
import { nonexhaustiveSwitchGuard, NoteRegex } from "./utils.ts";

export * from "./chord.ts";
export * from "./song.ts";

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

// https://en.wikipedia.org/wiki/Pitch_class
export const AllPitchClasses = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
export type PitchClass = (typeof AllPitchClasses)[number];

export function LetterToPitchClass(key: Letter): PitchClass {
  switch (key) {
    case "B#":
    case "C":
      return 0;
    case "Db":
    case "C#":
      return 1;
    case "D":
      return 2;
    case "Eb":
    case "D#":
      return 3;
    case "E":
    case "Fb":
      return 4;
    case "E#":
    case "F":
      return 5;
    case "Gb":
    case "F#":
      return 6;
    case "G":
      return 7;
    case "Ab":
    case "G#":
      return 8;
    case "A":
      return 9;
    case "Bb":
    case "A#":
      return 10;
    case "Cb":
    case "B":
      return 11;
    default:
      // just here to get static exhaustiveness checking (TS 5.x)
      // if we add another value to Letter, we will start getting compile-time errors here
      nonexhaustiveSwitchGuard(key);
  }
}

type LetterSpelledWithOneSharp =
  | "A#"
  | "B#"
  | "C#"
  | "D#"
  | "E#"
  | "F#"
  | "G#";

type LetterSpelledWithOneFlat =
  | "Ab"
  | "Bb"
  | "Cb"
  | "Db"
  | "Eb"
  | "Fb"
  | "Gb";

export type KeyDescription =
  | {
    natural?: undefined;
    spelledWithOneFlat: LetterSpelledWithOneFlat;
    spelledWithOneSharp: LetterSpelledWithOneSharp;
  }
  | {
    natural: Letter;
    spelledWithOneFlat?: undefined;
    spelledWithOneSharp: LetterSpelledWithOneSharp;
  }
  | {
    natural: Letter;
    spelledWithOneFlat: LetterSpelledWithOneFlat;
    spelledWithOneSharp?: undefined;
  }
  | {
    natural: Letter;
    spelledWithOneFlat?: undefined;
    spelledWithOneSharp?: undefined;
  };

export const PitchClassToKey: [
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
  { natural: "C", spelledWithOneSharp: "B#" }, // 0
  { spelledWithOneSharp: "C#", spelledWithOneFlat: "Db" }, // 1
  { natural: "D" }, // 2
  { spelledWithOneSharp: "D#", spelledWithOneFlat: "Eb" }, // 3
  { natural: "E", spelledWithOneFlat: "Fb" }, // 4
  { natural: "F", spelledWithOneSharp: "E#" }, // 5
  { spelledWithOneSharp: "F#", spelledWithOneFlat: "Gb" }, // 6
  { natural: "G" }, // 7
  { spelledWithOneSharp: "G#", spelledWithOneFlat: "Ab" }, // 8
  { natural: "A" }, // 9
  { spelledWithOneSharp: "A#", spelledWithOneFlat: "Bb" }, // 10
  { natural: "B", spelledWithOneFlat: "Cb" }, // 11
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

export const ConventionallyFlatMajorKeys = [
  <1> LetterToPitchClass("Db"),
  <3> LetterToPitchClass("Eb"),
  <5> LetterToPitchClass("F"),
  <8> LetterToPitchClass("Ab"),
  <10> LetterToPitchClass("Bb"),
];

export const RepeatedChordSymbol = "%";
export const AllRepeatedChordSymbols = [
  RepeatedChordSymbol,
  "/",
  "-",
  "𝄎",
];

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

export type BarlineClass =
  | "barline-single-open"
  | "barline-single-close"
  | "barline-double-open"
  | "barline-double-close"
  | "barline-repeat-open"
  | "barline-repeat-close";
