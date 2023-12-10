// A Pitch Class is an integer between 0..11 s.t.:
// 0 means "C", 1 means "C#", 2 means "D", etc
//
// a.k.a. "Integer Notation"
//
// 👉 https://en.wikipedia.org/wiki/Pitch_class
export type PitchClass = (typeof AllPitchClasses)[number];
export const AllPitchClasses = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export function transposePitchClass(pc: PitchClass, halfSteps: number) {
  return <PitchClass> modulo(pc + halfSteps, AllPitchClasses.length);
}

// in JS `%` actually means the "remainder" operator.
// but we want "modulo" because it doesn't return negative numbers
function modulo(n: number, m: number) {
  return (((n % m) + m) % m);
}
