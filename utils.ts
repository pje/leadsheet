import {
  KeySignatureMajorLetter,
  KeySignatureToAccidentalList,
  SigAccidental,
  FlatOrSharpSymbol,
  SigAccidentalToSymbol,
  KeyQualifier,
  Major,
  Minor,
  DegreesToKeys,
  KeysToDegrees,
  Letter,
  FlatSymbol,
  SharpSymbol,
  ConventionallyFlatKeyDegrees,
} from "./types.ts";

export function ReplaceDupesWithRepeats(chords: Array<string>): Array<string> {
  let previous: string | undefined = undefined;
  return chords.map((c) => {
    const result = !!c && c == previous ? "/" : c;
    previous = c;
    return result;
  });
}

// keyQualifer is, e.g.: "M", "m", "Major", "Minor", "Dorian", etc
export function CanonicalizeKeyQualifier(rawKeyQualifer: string): KeyQualifier {
  switch (rawKeyQualifer.trim()) {
    case "M":
      return Major;
    case "Major":
      return Major;
    case "major":
      return Major;
    case "maj":
      return Major;
    case "m":
      return Minor;
    case "minor":
      return Minor;
    case "Minor":
      return Minor;
    case "min":
      return Minor;
    default:
      return Major;
  }
}

export function htmlElementsForKeySignature(
  keySignature: KeySignatureMajorLetter
): Array<string> {
  const accidentalList = KeySignatureToAccidentalList.get(keySignature)!;

  return accidentalList.map(
    (e: SigAccidental) => `<div class="accidental ${e}">${e}</div>`
  );
}

export function transpose(
  noteName: Letter,
  halfSteps: number,
  preferredAccidental: FlatOrSharpSymbol = SharpSymbol
): Letter {
  if (halfSteps == 0) return noteName;

  const currentDegree = KeysToDegrees(noteName)!;
  let newDegree = (currentDegree + halfSteps) % DegreesToKeys.length;
  if (newDegree < 0) newDegree = DegreesToKeys.length + newDegree;

  const result = DegreesToKeys[newDegree];

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

export const NoteRegex = /^([A-G]{1}(?:[b#♯♭])?)(.*)$/;
