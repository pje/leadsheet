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

// Returns an array of arrays of at most `groupSize`.
//
// @example
// ```ts
//  groupsOf([1, 2, 3, 4, 5], 2)
//  => [[1, 2], [3, 4], [5]]
// ```
export function groupsOf<T>(
  array: Array<T>,
  groupSize: number,
): Array<Array<T>> {
  return array.reduce((resultArray: Array<Array<T>>, item, index) => {
    const groupIndex = Math.floor(index / groupSize);

    if (!resultArray[groupIndex]) {
      resultArray[groupIndex] = <Array<T>> [];
    }

    resultArray[groupIndex]!.push(item);

    return resultArray;
  }, []);
}
