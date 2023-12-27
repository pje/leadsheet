import { type FlatOrSharpSymbol, SharpSymbol } from "./notation.ts";
import { assertNotEquals } from "https://deno.land/std@0.209.0/assert/assert_not_equals.ts";
import { assertEquals } from "../test_utils.ts";
import { Chord } from "./chord.ts";
import { Add6, Add9, No, Over, Raise, Sus2, Sus4 } from "./chord/alteration.ts";
import { DefaultChordFormatterInstance } from "./chord/formatter.ts";
import { Power } from "./chord/quality/dyad.ts";
import { Aug7, DimM7 } from "./chord/quality/tetrad/nontertian.ts";
import {
  Dim7,
  Dom11,
  Dom13,
  Dom7,
  Dom9,
  Maj11,
  Maj13,
  Maj7,
  Maj7Sh5,
  Maj9,
  Min11,
  Min13,
  Min7,
  Min7Fl5,
  Min9,
  MinMaj7,
} from "./chord/quality/tetrad/tertian.ts";
import { Aug, Dim, Maj, Min } from "./chord/quality/triad.ts";

Deno.test("===", async (t) => {
  const a1 = new Chord("A", Maj, Raise(11));
  const a2 = new Chord("A", Maj, Raise(11));
  const b = new Chord("B", Maj, Raise(11));

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
});

Deno.test(Chord.prototype.dup.name, async (t) => {
  const b = new Chord("B", Maj, Raise(11));

  await t.step(
    `"${JSON.stringify(b)}.dup()" should === itself`,
    () => assertEquals(b, b.dup()),
  );
});

Deno.test(Chord.prototype.transpose.name, async (t) => {
  const cases = new Map<[Chord, number, FlatOrSharpSymbol], Chord>([
    [
      [new Chord("A", Maj7, Over("G")), 1, SharpSymbol],
      new Chord("A#", Maj7, Over("G#")),
    ],
    [
      [new Chord("A", Maj, Add6, Add9), 1, SharpSymbol],
      new Chord("A#", Maj, Add6, Add9),
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
    [new Chord("A", Maj), "A"],
    [new Chord("A", Min), "Am"],
    [new Chord("A", Dim), "Ao"],
    [new Chord("A", Aug), "A+"],

    [new Chord("A", Dom7), "A7"],
    [new Chord("A", Dom9), "A9"],
    [new Chord("A", Dom11), "A11"],
    [new Chord("A", Dom13), "A13"],
    [new Chord("A", Maj7), "AM7"],
    [new Chord("A", Maj9), "AM9"],
    [new Chord("A", Maj11), "AM11"],
    [new Chord("A", Maj13), "AM13"],
    [new Chord("A", Min7), "Am7"],
    [new Chord("A", Min9), "Am9"],
    [new Chord("A", Min11), "Am11"],
    [new Chord("A", Min13), "Am13"],

    [new Chord("A", Aug7), "A+7"],
    [new Chord("A", MinMaj7), "AmM7"],

    [new Chord("A", Dim7), "Ao7"],
    [new Chord("A", DimM7), "AoM7"],
    [new Chord("A", Maj7Sh5), "A+M7"],
    [new Chord("A", Min7Fl5), "Am7b5"],
    [new Chord("A", MinMaj7), "AmM7"],

    [new Chord("A", Power), "A5"],

    [new Chord("A", Maj, Add6), "A6"],
    [new Chord("A", Min, Add6), "Am6"],
    [new Chord("A", Maj, Add6, Add9), "A6/9"],

    [new Chord("A", Maj, Sus2), "Asus2"],
    [new Chord("A", Maj, Sus4), "Asus4"],
    [new Chord("A", Aug7, Raise(9), No(3)), "A+7#9(no3)"],
  ]);

  for (const [chord, expected] of cases) {
    await t.step(
      `"${JSON.stringify(chord)}" should print as "${expected}"`,
      () => assertEquals(expected, chord.print(DefaultChordFormatterInstance)),
    );
  }
});

// Deno.test(TypeMap.name, async (t) => {
//   const cases = new Map<Chord, QualityID>([
//     [new Chord("A", Maj), Maj_id],
//     [new Chord("A", Object.assign({}, Maj)), Maj_id],
//     [new Chord("A", Power), Power_id],
//   ]);

//   for (const [chord, expected] of cases) {
//     await t.step(
//       `"${JSON.stringify(chord)}" should typeMap to "${expected}"`,
//       () => assertEquals(expected, TypeMap(chord.quality)),
//     );
//   }
// });
