import { assertEquals } from "../../test_utils.ts";
import {
  Add6,
  Add9,
  Alteration,
  equals,
  isAdd9,
  sort,
  Sus2,
  Sus4,
  uniq,
} from "./alteration.ts";
import { SharpSymbol } from "../notation.ts";

Deno.test(isAdd9.name, async (t) => {
  const cases = new Map<Alteration, boolean>(
    [
      [new Alteration("add", 9), true],
      [new Alteration("add", 11), false],
      [new Alteration("omit", 9), false],
      [new Alteration("major", 9), false],
      [new Alteration("minor", 9), false],
    ],
  );
  for (const [alteration, expected] of cases) {
    const result = isAdd9(alteration);
    await t.step(
      `${alteration.print()} should be ${expected}`,
      () => assertEquals(expected, result),
    );
  }
});

Deno.test(Alteration.prototype.transpose.name, async (t) => {
  const add9 = new Alteration("add", 9);
  const maj9 = new Alteration("major", 9);
  const xOvG = new Alteration("compound", "G");
  const xOvD = new Alteration("compound", "D");

  const cases = new Map<[Alteration, number], Alteration>(
    [
      [[add9, -5], add9],
      [[maj9, -5], maj9],
      [[xOvG, -5], xOvD],
    ],
  );
  for (const [[alteration, halfSteps], expected] of cases) {
    const printed = alteration.print();

    await t.step(`${printed} ${halfSteps} shouldBe ${expected.print()}`, () => {
      assertEquals(expected, alteration.transpose(halfSteps, SharpSymbol));
    });
  }
});

Deno.test(equals.name, async (t) => {
  const maj9 = new Alteration("major", 9);

  const cases = new Map<[Alteration, Alteration], boolean>(
    [
      [[Add6, Add6], true],
      [[Sus4, Sus4], true],
      [[Add6, Add9], false],
      [[maj9, Add9], false],
    ],
  );

  for (const [[a1, a2], expected] of cases) {
    await t.step(
      `${JSON.stringify(a1)} should${expected ? "" : " not"} === ${
        JSON.stringify(a2)
      }`,
      () => {
        assertEquals(expected, equals(a1, a2));
      },
    );
  }
});

Deno.test(sort.name, async (t) => {
  const cases = new Map<Array<Alteration>, Array<Alteration>>([
    [[], []],
    [[Add6], [Add6]],
    [[Add6, Sus2, Add9, Sus4], [Sus4, Sus2, Add9, Add6]],
  ]);

  for (const [input, expected] of cases) {
    await t.step(
      `${JSON.stringify(input)} should sort to as ${JSON.stringify(expected)}`,
      () => assertEquals(expected, sort(input)),
    );
  }
});

Deno.test(uniq.name, async (t) => {
  const cases = new Map<Alteration[], Alteration[]>(
    [
      [[Sus2], [Sus2]],
      [[Sus2, Sus2], [Sus2]],
      [[Add6, Sus2, Add6, Add9, Sus4, Add9], [Sus4, Sus2, Add9, Add6]],
    ],
  );

  for (const [input, expected] of cases) {
    await t.step(
      `${JSON.stringify(input)} should uniqify as ${JSON.stringify(expected)}`,
      () => assertEquals(expected, uniq(input)),
    );
  }
});
