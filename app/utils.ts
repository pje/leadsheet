const NoteRegex = /^([A-G]{1}(?:[#♯b♭𝄪𝄫])?)(.*)$/;

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
