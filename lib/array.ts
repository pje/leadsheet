// Returns a new array with all undefined/null entries removed.
//
// @example
// ```ts
//  compact([1, 2, undefined, 3, null, 4])
//  => [1, 2, 3, 4]
// ```
export function compact<T>(array: Array<T>): Array<NonNullable<T>> {
  return array.filter(Boolean) as Array<NonNullable<T>>;
}

// Returns an array of arrays of at most `groupSize`.
//
// @example
// ```ts
//  groupsOf([1, 2, 3, 4, 5], 2)
//  => [[1, 2], [3, 4], [5]]
// ```
export function groupsOf<T>(array: T[], groupSize: 2): Array<[T, T?]>;
export function groupsOf<T>(array: T[], groupSize: number): Array<T[]>;
export function groupsOf<T>(array: T[], groupSize: number): Array<T[]> {
  return array.reduce((resultArray: Array<T[]>, item, index) => {
    const groupIndex = Math.floor(index / groupSize);

    if (!resultArray[groupIndex]) {
      resultArray[groupIndex] = <Array<T>> [];
    }

    resultArray[groupIndex]!.push(item);

    return resultArray;
  }, []);
}

// Split an array into two arrays based on `predicate`'s return value.
//
// @example
// ```ts
//  partition([1, 2, 3, 4, 5], (e) => isEven())
//  => [[2, 4, 6], [1, 3, 5]]
// ```
export function partition<T>(
  as: Array<T>,
  predicate: (a: T) => boolean,
): [Array<T>, Array<T>] {
  const [one, two]: [Array<T>, Array<T>] = [[], []];
  as.forEach((a) => predicate(a) ? one.push(a) : two.push(a));
  return [one, two];
}

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
