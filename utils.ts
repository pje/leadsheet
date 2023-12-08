import { ParseChord } from "./parser/parser.ts";
import {
  ChordQuality,
  ConventionallyFlatMajorKeys,
  FlatOrSharpSymbol,
  FlatSymbol,
  KeyQualifier,
  KeySignatureMajorLetter,
  KeySignatureToAccidentalList,
  Letter,
  LetterToPitchClass,
  Major,
  Minor,
  PitchClass,
  PitchClassToKey,
  SharpSymbol,
  SigAccidental,
} from "./types.ts";

export function replaceDupesWithRepeats(chords: Array<string>): Array<string> {
  let previous: string | undefined = undefined;
  return chords.map((c) => {
    const result = !!c && c == previous ? "/" : c;
    previous = c;
    return result;
  });
}

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

export function htmlElementsForKeySignature(
  keySignature: KeySignatureMajorLetter,
): Array<string> {
  const accidentalList = KeySignatureToAccidentalList.get(keySignature)!;

  return accidentalList.map(
    (e: SigAccidental) => `<div class="accidental ${e}">${e}</div>`,
  );
}

export function transposeLetter(
  noteName: Letter,
  halfSteps: number,
  preferredAccidental: FlatOrSharpSymbol = SharpSymbol,
): Letter {
  if (halfSteps == 0) return noteName;

  const currentDegree = LetterToPitchClass(noteName)!;
  let newDegree = (currentDegree + halfSteps) % PitchClassToKey.length;
  if (newDegree < 0) newDegree = PitchClassToKey.length + newDegree;

  const result = PitchClassToKey[newDegree]!;

  if (result.natural) return result.natural;

  return preferredAccidental == FlatSymbol
    ? result.spelledWithOneFlat
    : result.spelledWithOneSharp;
}

export function conventionalizeKey(key: Letter): Letter {
  const degree = LetterToPitchClass(key);

  const result = PitchClassToKey[degree];

  if ((ConventionallyFlatMajorKeys as Array<PitchClass>).includes(degree)) {
    return result.natural || result.spelledWithOneFlat;
  } else if (result.natural) {
    return result.natural;
  } else {
    return key;
  }
}

export function accidentalPreferenceForKey(key: Letter) {
  const degree = LetterToPitchClass(key);
  return (ConventionallyFlatMajorKeys as Array<PitchClass>).includes(degree)
    ? FlatSymbol
    : SharpSymbol;
}

export function chordColor(
  c: string,
): ChordQuality | undefined {
  return ParseChord(c).value?.quality;
}

export const NoteRegex = /^([A-G]{1}(?:[#♯b♭𝄪𝄫])?)(.*)$/;

export function unicodeifyMusicalSymbols(s: string) {
  let [note, flavor] = s.split(NoteRegex).filter(String);
  note ||= "";
  flavor ||= "";

  return `${note}<sup>${flavor}<sup>`.replace(
    "b",
    `<span class="unicode-flat">♭</span>`,
  ).replace(
    "#",
    `<span class="unicode-sharp">♯</span>`,
  );
}

export function titleize(s: string): string {
  return s.split(/(?=[A-Z][a-z])|[\-_]/).map((str) => {
    if (str === "") {
      return str;
    } else {
      const [head, ...rest] = str;
      return `${head?.toUpperCase()}${rest.join("")}`;
    }
  }).join(" ");
}

export function nonexhaustiveSwitchGuard(_: never): never {
  throw new Error("Switch statement was non-exhaustive");
}
