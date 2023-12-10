export const FlatSymbol = "♭" as const;
export const SharpSymbol = "♯" as const;
export type FlatOrSharpSymbol = typeof FlatSymbol | typeof SharpSymbol;

export const NoteRegex = /^([A-G]{1}(?:[#♯b♭𝄪𝄫])?)(.*)$/;
