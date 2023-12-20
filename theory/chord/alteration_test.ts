import { assertEquals } from "../../test_utils.ts";
import { Alteration } from "./alteration.ts";
import { SharpSymbol } from "../notation.ts";

Deno.test(Alteration.prototype.isAdd9.name, async (t) => {
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
    const result = alteration.isAdd9();
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
