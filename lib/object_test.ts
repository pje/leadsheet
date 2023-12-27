import { omit, pick } from "./object.ts";
import { assertEquals } from "../test_utils.ts";

Deno.test(omit.name, () => {
  const o = { foo: 1, bar: 2, baz: 3 };
  const result = omit(o, "foo", "baz");
  assertEquals({ bar: 2 }, result);
});

Deno.test(pick.name, () => {
  const o = { foo: 1, bar: 2, baz: 3 };
  const result = pick(o, "foo", "baz");
  assertEquals({ foo: 1, baz: 3 }, result);
});
