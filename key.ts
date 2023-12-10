import { type FlatOrSharpSymbol, FlatSymbol, SharpSymbol } from "./types.ts";
import { type PitchClass } from "./pitch_class.ts";
import { NoteRegex } from "./utils.ts";
import {
  GetLettersForPitchClass,
  type Letter,
  LetterToPitchClass,
} from "./letter.ts";

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

const SigAccidentalToSymbol = new Map<SigAccidental, FlatOrSharpSymbol>([
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

export { SigAccidentalToSymbol };

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

export function canonicalizeKeyQualifier(rawKeyQualifer: string): KeyQualifier {
  switch (rawKeyQualifer.trim()) {
    case "":
    case "M":
    case "Major":
    case "major":
    case "maj":
      return Major;
    case "m":
    case "Minor":
    case "minor":
    case "min":
      return Minor;
    default:
      return Major;
  }
}

// e.g. It's more common to talk about "E" major than "Fb" major
export function conventionalizeKey(key: Letter): Letter {
  const degree = LetterToPitchClass(key);

  const [natural, flat, _sharp] = GetLettersForPitchClass[degree];

  return ((ConventionallyFlatMajorKeys as Array<PitchClass>).includes(degree))
    ? (natural || flat)
    : natural
    ? natural
    : key;
}

export function accidentalPreferenceForKey(key: Letter) {
  const degree = LetterToPitchClass(key);
  return (ConventionallyFlatMajorKeys as Array<PitchClass>).includes(degree)
    ? FlatSymbol
    : SharpSymbol;
}

export function htmlElementsForKeySignature(
  keySignature: KeySignatureMajorLetter,
): Array<string> {
  const accidentalList = KeySignatureToAccidentalList.get(keySignature)!;

  return accidentalList.map(
    (e: SigAccidental) => `<div class="accidental ${e}">${e}</div>`,
  );
}
