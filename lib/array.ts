// Returns a matrix of the two arrays (possibly of different lengths).
//
// Ignores extra entries!
//
// @example
// ```ts
//  zip([1, 2], [3, 4, 5])
//  => [[1, 3], [2, 4]]
// ```
export function zip<T1, T2>(c1: Array<T1>, c2: Array<T2>): Array<[T1, T2]> {
  const length = Math.min(c1.length, c2.length);
  const zipped: Array<[T1, T2]> = [];

  for (let i = 0; i < length; i++) {
    zipped.push([c1[i]!, c2[i]!]);
  }

  return zipped;
}
