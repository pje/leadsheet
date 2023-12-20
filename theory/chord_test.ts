import { type FlatOrSharpSymbol, SharpSymbol } from "./notation.ts";
import { assertNotEquals } from "https://deno.land/std@0.209.0/assert/assert_not_equals.ts";
import { assertEquals } from "../test_utils.ts";
import { Chord } from "./chord.ts";
import { Alteration } from "./chord/alteration.ts";

Deno.test("===", async (t) => {
  const a1 = new Chord("A", "maj", 7, new Alteration("raise", 11));
  const a2 = new Chord("A", "maj", 7, new Alteration("raise", 11));
  const b = new Chord("B", "maj", 7, new Alteration("raise", 11));

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
      [
        new Chord("A", "maj", 7, new Alteration("compound", "G")),
        1,
        SharpSymbol,
      ],
      new Chord("A#", "maj", 7, new Alteration("compound", "G#")),
    ],
    [
      [new Chord("A", "maj", 6, new Alteration("add", 9)), 1, SharpSymbol],
      new Chord("A#", "maj", 6, new Alteration("add", 9)),
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
    [new Chord("A", "min", 6), "Am6"],
    [new Chord("A", "maj", 6, new Alteration("add", 9)), "A6/9"],
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
    [
      new Chord(
        "A",
        "aug",
        7,
        new Alteration("raise", 9),
        new Alteration("omit", 3),
      ),
      "A+7#9(no3)",
    ],
  ]);

  for (const [chord, expected] of cases) {
    await t.step(
      `"${JSON.stringify(chord)}" should print as "${expected}"`,
      () => assertEquals(expected, chord.print()),
    );
  }
});
