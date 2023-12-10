import { NoteRegex } from "../theory/notation.ts";

export function replaceDupesWithRepeats(chords: Array<string>): Array<string> {
  let previous: string | undefined = undefined;
  return chords.map((c) => {
    const result = !!c && c == previous ? "/" : c;
    previous = c;
    return result;
  });
}

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
