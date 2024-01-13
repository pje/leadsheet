import { type FlatOrSharpSymbol, SharpSymbol } from "./notation.ts";
import { assertNotEquals } from "https://deno.land/std@0.212.0/assert/assert_not_equals.ts";
import { assertEquals } from "../test_utils.ts";
import {
  canonicalize,
  Chord,
  identify,
  QualityID,
  QualityIdToQuality,
} from "./chord.ts";
import {
  Add6,
  Add9,
  Alteration,
  AlterMajor,
  AlterMinor,
  MakeMaj,
  Over,
  Raise,
} from "./chord/alteration.ts";
import { Power, Power_id } from "./chord/quality/dyad.ts";
import {
  Aug7,
  Aug7_id,
  DimM7,
  DimM7_id,
  Maj6,
  Maj69,
  Maj69_id,
  Maj6_id,
  Maj6Sh5,
  Maj6Sh5_id,
  Min6,
  Min69,
  Min69_id,
  Min6_id,
} from "./chord/quality/tetrad/nontertian.ts";
import {
  Dim7,
  Dim7_id,
  Dom7,
  Dom7_id,
  Maj7,
  Maj7_id,
  Maj7Sh5,
  Maj7Sh5_id,
  Min7,
  Min7_id,
  Min7Fl5,
  Min7Fl5_id,
  MinMaj7,
  MinMaj7_id,
} from "./chord/quality/tetrad/tertian.ts";
import {
  Aug,
  Aug_id,
  Dim,
  Dim_id,
  Maj,
  Maj_id,
  Min,
  Min_id,
} from "./chord/quality/triad.ts";

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

const tautologies = new Map<Chord, QualityID>([
  [new Chord("A", Aug), Aug_id],
  [new Chord("A", Dim), Dim_id],
  [new Chord("A", Maj), Maj_id],
  [new Chord("A", Min), Min_id],
  [new Chord("A", Maj7), Maj7_id],
  [new Chord("A", Dom7), Dom7_id],
  [new Chord("A", Min7), Min7_id],
  [new Chord("A", Aug7), Aug7_id],
  [new Chord("A", Dim7), Dim7_id],
  [new Chord("A", DimM7), DimM7_id],
  [new Chord("A", Maj7Sh5), Maj7Sh5_id],
  [new Chord("A", Min7Fl5), Min7Fl5_id],
  [new Chord("A", MinMaj7), MinMaj7_id],
  [new Chord("A", Maj6), Maj6_id],
  [new Chord("A", Min6), Min6_id],
  [new Chord("A", Maj69), Maj69_id],
  [new Chord("A", Min69), Min69_id],
  [new Chord("A", Maj6Sh5), Maj6Sh5_id],
  [new Chord("A", Power), Power_id],
]);

const alterationSynonyms = new Map<QualityID, Chord[]>([
  [
    Aug7_id,
    [
      new Chord("A", Aug, new Alteration(AlterMinor, 7)),
      new Chord("A", Dom7, Raise(5)),
    ],
  ],
  [
    Maj7Sh5_id,
    [
      new Chord("A", Maj7, Raise(5)),
      new Chord("A", Aug, new Alteration(AlterMajor, 7)),
    ],
  ],
  [
    DimM7_id,
    [
      new Chord("A", Dim, new Alteration(AlterMajor, 7)),
    ],
  ],
  [
    Maj6_id,
    [
      new Chord("A", Maj, Add6),
    ],
  ],
  [
    Maj69_id,
    [
      new Chord("A", Maj, Add6, Add9),
    ],
  ],
  [
    Min6_id,
    [
      new Chord("A", Min, Add6),
    ],
  ],
  [
    Min69_id,
    [
      new Chord("A", Min, Add6, Add9),
    ],
  ],
  [
    MinMaj7_id,
    [
      new Chord("A", Min, MakeMaj(7)),
    ],
  ],
]);

Deno.test(identify.name, async (t) => {
  for (const [input, expected] of tautologies) {
    await t.step(
      `should identify ${JSON.stringify(input)} as ${expected}`,
      () => {
        const result = identify(input);
        assertEquals(expected, result);
      },
    );
  }

  for (const [expected, inputs] of alterationSynonyms) {
    for (const input of inputs) {
      await t.step(
        `should identify synonym ${JSON.stringify(input)} as ${expected}`,
        () => {
          const result = identify(input);
          assertEquals(expected, result);
        },
      );
    }
  }
});

Deno.test(canonicalize.name, async (t) => {
  for (const [input, expected] of tautologies) {
    await t.step(
      `should canonicalize ${JSON.stringify(input)} to ${expected}`,
      () => {
        const q = QualityIdToQuality[expected];
        const expectedChord = new Chord(input.tonic, q);
        const result = canonicalize(input);
        assertEquals(expectedChord, result);
      },
    );
  }

  for (const [expected, inputs] of alterationSynonyms) {
    for (const input of inputs) {
      await t.step(
        `should canonicalize synonym ${JSON.stringify(input)} to ${expected}`,
        () => {
          const q = QualityIdToQuality[expected];
          const expectedChord = new Chord(input.tonic, q);
          const result = canonicalize(input);
          assertEquals(expectedChord, result);
        },
      );
    }
  }
});
