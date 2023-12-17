const NoteRegex = /^([A-G]{1}(?:[#♯b♭𝄪𝄫])?)(.*)$/;

export function unicodeifyMusicalSymbols(s: string) {
  let [note, flavor] = s.split(NoteRegex).filter(String);
  note ||= "";
  flavor ||= "";

  return `${note}<sup>${flavor}<sup>`.replaceAll(/b|#/g, (substr: string) => {
    const [symbol, klass] = substr === "#" ? ["♯", "sharp"] : ["♭", "flat"];
    return `<span class="unicode-${klass}">${symbol}</span>`;
  });
}
