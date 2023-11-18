import {
  KeySignatureMajorLetter,
  KeySignatureToAccidentalList,
  SigAccidental,
  FlatOrSharpSymbol,
  SigAccidentalToSymbol,
  KeyQualifier,
  Major,
  Minor,
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

function ExtractAccidentalSymbol(
  letter: KeySignatureMajorLetter
): FlatOrSharpSymbol {
  // return SigAccidentalToSymbol.get(letter)!;
  return "♭";
}

function HTMLElementsForKeySignature(
  keySignature: KeySignatureMajorLetter
): Array<string> {
  const accidentalList = KeySignatureToAccidentalList.get(keySignature)!;

  return accidentalList.map(
    (e: SigAccidental) => `<div class="accidental ${e}">${e}</div>`
  );
}
