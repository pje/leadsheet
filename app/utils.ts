const NoteRegex = /^([A-G]{1}(?:[#♯b♭𝄪𝄫])?)(.*)$/;

export function unicodeifyMusicalSymbols(s: string) {
  let [note, flavor] = s.split(NoteRegex).filter(String);
  note ||= "";
  flavor ||= "";

  let [superable, ...after] = flavor.split("/"); // e.g. Csus2/E
  superable ||= "";
  if (after.length > 0) after = ["/", ...after];

  return `${note}<sup>${superable}</sup>${after.join("")}`.replaceAll(
    /b|#/g,
    (substr: string) => {
      const [symbol, klass] = substr === "#" ? ["♯", "sharp"] : ["♭", "flat"];
      return `<span class="unicode-${klass}">${symbol}</span>`;
    },
  );
}
