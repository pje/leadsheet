export type Result<T> =
  | { error: undefined; value: T }
  | { error: Error; value: undefined };

export const Ok = <T>(t: T): Result<T> => {
  return { error: undefined, value: t };
};

export const Err = (e: string | Error): Result<never> => {
  const error = typeof e === "string" ? new Error(e) : e;
  return { error, value: undefined };
};
