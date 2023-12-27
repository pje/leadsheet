export function pick<T, K extends keyof T>(o: T, ...keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = o[key];
  }
  return result;
}

export function omit<T, K extends keyof T>(o: T, ...keys: K[]): Omit<T, K> {
  const result = Object.assign({}, o);
  keys.forEach((k) => delete result[k]);
  return result;
}
