// Returns a new object having only the provided `keys`.
//
// @example
// ```ts
//  pick({foo: "hello", bar: undefined, baz: null }, "foo", "bar")
//  => {foo: "hello", bar: undefined}
// ```
export function pick<T, K extends keyof T>(o: T, ...keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = o[key];
  }
  return result;
}

// Returns a new object with all the specified `keys` removed.
//
// @example
// ```ts
//  omit({foo: "hello", bar: undefined, baz: null }, "bar", "baz")
//  => {foo: "hello"}
// ```
export function omit<T, K extends keyof T>(o: T, ...keys: K[]): Omit<T, K> {
  const result = Object.assign({}, o);
  keys.forEach((k) => delete result[k]);
  return result;
}

// Returns a new object with all null/undefined values removed.
//
// @example
// ```ts
//  compact({foo: "hello", bar: undefined, baz: null })
//  => {foo: "hello"}
// ```
export function compact<T extends object>(o: T): T {
  const result = {} as T;
  for (const [k, v] of Object.entries(o)) {
    if ((v !== undefined) && (v !== null)) {
      (result as Record<string, unknown>)[k] = v;
    }
  }
  return result;
}
