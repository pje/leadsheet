import {
  ColorClass,
  ConventionallyFlatKeyDegrees,
  DegreesToKeys,
  FlatOrSharpSymbol,
  FlatSymbol,
  KeyQualifier,
  KeySignatureMajorLetter,
  KeySignatureToAccidentalList,
  KeysToDegrees,
  Letter,
  Major,
  Minor,
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

export function transpose(
  noteName: Letter,
  halfSteps: number,
  preferredAccidental: FlatOrSharpSymbol = SharpSymbol,
): Letter {
  if (halfSteps == 0) return noteName;

  const currentDegree = KeysToDegrees(noteName)!;
  let newDegree = (currentDegree + halfSteps) % DegreesToKeys.length;
  if (newDegree < 0) newDegree = DegreesToKeys.length + newDegree;

  const result = DegreesToKeys[newDegree]!;

  if (result.natural) return result.natural;

  return preferredAccidental == FlatSymbol
    ? result.spelledWithOneFlat
    : result.spelledWithOneSharp;
}

export function conventionalizeKey(key: Letter): Letter {
  const degree = KeysToDegrees(key);

  const result = DegreesToKeys[degree];

  if (ConventionallyFlatKeyDegrees.includes(degree)) {
    return result.natural || result.spelledWithOneFlat;
  } else if (result.natural) {
    return result.natural;
  } else {
    return key;
  }
}

export function accidentalPreferenceForKey(key: Letter) {
  const degree = KeysToDegrees(key);
  return ConventionallyFlatKeyDegrees.includes(degree)
    ? FlatSymbol
    : SharpSymbol;
}

export function chordColor(
  c: string,
): ColorClass | undefined {
  c = c.trim();
  if (c.match(/^[A-G]{1}[#♯b♭𝄪𝄫]?m(?:6|7|9|11|13)?/)) {
    return "min";
  } else if (c.match(/^[A-G]{1}[#♯b♭𝄪𝄫]?(?:M|6|(?:6\/9)|$)/)) {
    return "maj";
  } else if (c.match(/^[A-G]{1}[#♯b♭𝄪𝄫]?(?:7|9|11|13|alt)/)) {
    return "dom";
  } else if (c.match(/^[A-G]{1}[#♯b♭𝄪𝄫]?(?:5)/)) {
    return "pow";
  } else if (c.match(/^[A-G]{1}[#♯b♭𝄪𝄫]?sus/)) {
    return "sus";
  } else if (c.match(/^[A-G]{1}[#♯b♭𝄪𝄫]?(?:dim|o)/)) {
    return "dim";
  } else if (c.match(/^[A-G]{1}[#♯b♭𝄪𝄫]?(?:aug|\+|⁺)/)) {
    return "aug";
  } else {
    return undefined;
  }
}

export const NoteRegex = /^([A-G]{1}(?:[#♯b♭𝄪𝄫])?)(.*)$/;
