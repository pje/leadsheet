import { assertNotEquals } from "https://deno.land/std@0.208.0/assert/assert_not_equals.ts";
import { assertEquals } from "./test_utils.ts";
import { Add9, Chord, FlatOrSharpSymbol, SharpSymbol } from "./types.ts";

Deno.test("===", async (t) => {
  const a1 = new Chord("A", "maj", 7, "#11");
  const a2 = new Chord("A", "maj", 7, "#11");
  const b = new Chord("B", "maj", 7, "#11");

  await t.step(
    `"${JSON.stringify(a1)}" should === itself`,
    () => assertEquals(a1, a1),
  );

  await t.step(
    `"${JSON.stringify(a1)}" should === ${JSON.stringify(a2)}`,
    () => assertEquals(a1, a2),
  );

  await t.step(
    `"${JSON.stringify(b)}" should !== ${JSON.stringify(a1)}`,
    () => assertNotEquals(b, a1),
  );

  await t.step(
    `"${JSON.stringify(b)}.dup()" should === itself`,
    () => assertEquals(b, b.dup()),
  );
});

Deno.test(Chord.prototype.transpose.name, async (t) => {
  const cases = new Map<[Chord, number, FlatOrSharpSymbol], Chord>([
    [
      [new Chord("A", "maj", 7, "/G"), 1, SharpSymbol],
      new Chord("A#", "maj", 7, "/G#"),
    ],
  ]);

  for (const [k, expected] of cases) {
    const [input, halfSteps, preferredAccidental] = k;
    await t.step(
      `"${
        JSON.stringify(input)
      }" up ${halfSteps} halfSteps (prefer ${preferredAccidental}) should transpose to "${
        JSON.stringify(expected)
      }"`,
      () =>
        assertEquals(
          expected,
          input.transpose(halfSteps, preferredAccidental),
        ),
    );
  }
});

Deno.test(Chord.prototype.print.name, async (t) => {
  const cases = new Map<Chord, string>([
    [new Chord("A", "maj"), "A"],
    [new Chord("A", "maj", 6), "A6"],
    [new Chord("A", "maj", 6, Add9), "A6/9"],
    [new Chord("A", "maj", 7), "AM7"],
    [new Chord("A", "maj", 9), "AM9"],
    [new Chord("A", "maj", 11), "AM11"],
    [new Chord("A", "maj", 13), "AM13"],
    [new Chord("A", "min"), "Am"],
    [new Chord("A", "dim"), "Ao"],
    [new Chord("A", "pow"), "A5"],
    [new Chord("A", "dom", 7), "A7"],
    [new Chord("A", "sus", 2), "Asus2"],
    [new Chord("A", "sus", 4), "Asus4"],
    [new Chord("A", "aug", 7), "A+7"],
    [new Chord("A", "aug", 7, "#9", "(no 5)"), "A+7#9(no 5)"],
  ]);

  for (const [k, v] of cases) {
    const input = k;
    await t.step(
      `"${JSON.stringify(input)}" should print as "${v}"`,
      () => assertEquals(v, input.print()),
    );
  }
});
