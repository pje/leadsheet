import { type FlatOrSharpSymbol, FlatSymbol, SharpSymbol } from "./notation.ts";
import { type PitchClass } from "./pitch_class.ts";
import {
  type Letter,
  LettersForPitchClass,
  LetterToPitchClass,
  transposeLetter,
} from "./letter.ts";
import { nonexhaustiveSwitchGuard } from "../lib/switch.ts";

export class Key {
  public tonic: Letter;
  public flavor: KeyFlavor;

  constructor(tonic: Letter, flavor?: KeyFlavor) {
    this.flavor = flavor ? canonicalizeFlavor(flavor) : KeyFlavorMajor;
    this.tonic = conventionalize(tonic, this.flavor);
  }

  transpose(halfSteps: number): Key {
    const destinationLetter = transposeLetter(this.tonic, halfSteps);
    return new Key(destinationLetter, this.flavor);
  }

  accidentalPreference(): FlatOrSharpSymbol | undefined {
    if (
      this.signature().length === 0 ||
      this.flavor !== Major && this.flavor !== Minor
    ) return undefined;

    const relativeMajor = this.flavor === Minor
      ? transposeLetter(this.tonic, 3)
      : this.tonic;

    const pc = LetterToPitchClass(relativeMajor);

    return (ConventionallyFlatMajorKeys as Array<PitchClass>).includes(pc)
      ? FlatSymbol
      : SharpSymbol;
  }

  signature(): AccidentalList {
    if (this.flavor !== Major && this.flavor !== Minor) return _0_Sharps; // unknown
    const relativeMajor = this.flavor === Minor
      ? transposeLetter(this.tonic, 3)
      : this.tonic;

    return MajorKeyToAccidentalList(relativeMajor);
  }

  format(): string {
    return `${this.tonic}${this.flavor}`;
  }
}

export const Major = "M";
export const Minor = "m";
export type KeyQualifier = typeof Major | typeof Minor;

export const ConventionallyFlatMajorKeys = [
  // <0> LetterToPitchClass("C"), // CM has no accidentals
  <1> LetterToPitchClass("Db"),
  <3> LetterToPitchClass("Eb"),
  <5> LetterToPitchClass("F"),
  <8> LetterToPitchClass("Ab"),
  <10> LetterToPitchClass("Bb"),
];

export const ConventionallySharpMinorKeys = [
  <1> LetterToPitchClass("C#"),
  <4> LetterToPitchClass("E"),
  <6> LetterToPitchClass("F#"),
  <8> LetterToPitchClass("G#"),
  // <9> LetterToPitchClass("A"), // Am has no accidentals
  <11> LetterToPitchClass("B"),
];

export const ConventionallyAmbiguousMajorKeys = [
  <6> LetterToPitchClass("Gb"), // F#M/GbM is ambiguous
];

export const ConventionallyAmbiguousMinorKeys = [
  <3> LetterToPitchClass("Eb"), // Ebm/D#m is ambiguous
];

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
export type KeyFlavor =
  | typeof KeyFlavorMajor
  | typeof KeyFlavorMinor
  | Mode
  | string;

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

const MajorKeyToAccidentalList = (l: Letter): AccidentalList => {
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

function canonicalizeFlavor(str: string | undefined): KeyQualifier | string {
  if (str === undefined || str === "" || str === "M") return Major;

  switch (str.toLowerCase().trim()) {
    case "major":
    case "maj":
      return Major;
    case "minor":
    case "min":
    case "m":
      return Minor;
    default:
      return str;
  }
}

// e.g. "G# minor" is the same as "Ab minor", but we prefer G# because it has fewer accidentals
function conventionalize(tonic: Letter, flavor: string): Letter {
  const pc = LetterToPitchClass(tonic);

  if (flavor === Major) {
    const isConventionallyFlat =
      (ConventionallyFlatMajorKeys as Array<PitchClass>).includes(pc);
    const [natural, flat, _sharp] =
      LettersForPitchClass[LetterToPitchClass(tonic)];
    return isConventionallyFlat ? (natural || flat) : natural ? natural : tonic;
  } else if (flavor === Minor) {
    const isAmbiguous = (ConventionallyAmbiguousMinorKeys as Array<PitchClass>)
      .includes(pc);
    const isConventionallySharp =
      (ConventionallySharpMinorKeys as Array<PitchClass>).includes(pc);
    const [natural, flat, sharp] =
      LettersForPitchClass[LetterToPitchClass(tonic)];

    if (natural) return natural;
    if (isAmbiguous) return tonic;
    return isConventionallySharp ? sharp : flat;
  } else {
    return tonic;
  }
}

export function htmlElementsForKey(
  key: Key,
): Array<string> {
  const accidentalList = key.signature();
  return accidentalList.map(
    (e: SigAccidental) => `<div class="accidental ${e}">${e}</div>`,
  );
}
