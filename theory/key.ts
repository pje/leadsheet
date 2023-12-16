import {
  type FlatOrSharpSymbol,
  FlatSymbol,
  NoteRegex,
  SharpSymbol,
} from "./notation.ts";
import { type PitchClass } from "./pitch_class.ts";
import {
  GetLettersForPitchClass,
  type Letter,
  LetterToPitchClass,
} from "./letter.ts";
import { nonexhaustiveSwitchGuard } from "../lib/switch.ts";

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

export const Ionian = "ionian" as const;
export const Dorian = "dorian" as const;
export const Phyrgian = "phyrgian" as const;
export const Lydian = "lydian" as const;
export const Mixolydian = "mixolydian" as const;
export const Aeolian = "aeolian" as const;
export const Locrian = "locrian" as const;
export type Mode =
  | typeof Ionian
  | typeof Dorian
  | typeof Phyrgian
  | typeof Lydian
  | typeof Mixolydian
  | typeof Aeolian
  | typeof Locrian;

export const KeyFlavorMajor = "M" as const;
export const KeyFlavorMinor = "m" as const;
export type KeyFlavor = typeof KeyFlavorMajor | typeof KeyFlavorMinor | Mode;

export class Key {
  public tonic: Letter;
  public flavor: KeyFlavor;

  constructor(tonic: Letter, flavor?: KeyFlavor) {
    this.tonic = tonic;
    this.flavor = flavor || KeyFlavorMajor;
  }
}

export function KeyFromString(s: string): Key | undefined {
  const matches = s.match(NoteRegex);
  const tonic = (matches && matches[1]) || undefined;
  const rest = (matches && matches[2]) || undefined;

  if (tonic) {
    return new Key(
      <Letter> tonic,
      rest ? (<KeyFlavor> canonicalizeKeyQualifier(rest)) : undefined,
    );
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

export const KeySignatureToAccidentalList = (l: Letter): AccidentalList => {
  switch (l) {
    case "C":
    case "B#":
      return _0_Sharps;
    case "G":
      return _1_Sharps;
    case "D":
      return _2_Sharps;
    case "A":
      return _3_Sharps;
    case "E":
    case "Fb":
      return _4_Sharps;
    case "B":
    case "Cb":
      return _5_Sharps;
    case "F#":
      return _6_Sharps;
    case "F":
    case "E#":
      return _1_Flats;
    case "Bb":
    case "A#":
      return _2_Flats;
    case "Eb":
    case "D#":
      return _3_Flats;
    case "Ab":
    case "G#":
      return _4_Flats;
    case "Db":
    case "C#":
      return _5_Flats;
    case "Gb":
      return _6_Flats;
    default:
      nonexhaustiveSwitchGuard(l);
  }
};

export function canonicalizeKeyQualifier(
  rawKeyQualifer: string,
): KeyQualifier | string {
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
      return rawKeyQualifer;
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
  const accidentalList = KeySignatureToAccidentalList(keySignature)!;

  return accidentalList.map(
    (e: SigAccidental) => `<div class="accidental ${e}">${e}</div>`,
  );
}
