// Degrees that can be referenced in chord alterations
//
// e.g.
//   valid: "CM9(no 5)", "Cm7(#4)"
// invalid: "CM7(no 1)"
//
export type AlterableDegree = 2 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 13;

// Degrees that define an *extended tertian chord*
//
// e.g.
//    valid: "CM7", "C13", "Cm11"
//  invalid: "CM8", "Cm16"
export type Extent = 7 | 9 | 11 | 13;
