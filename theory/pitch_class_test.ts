import { type PitchClass, transposePitchClass } from "./pitch_class.ts";
import { assertEquals } from "../test_utils.ts";

Deno.test(transposePitchClass.name, async (t) => {
  const cases = new Map<[PitchClass, number], PitchClass>([
    [[0, 0], 0],
    [[0, 1], 1],
    [[0, 5], 5],
    [[0, 12], 0],
    [[0, 13], 1],
    [[0, -1], 11],
    [[0, -5], 7],
    [[0, -13], 11],
  ]);

  for (const [k, v] of cases) {
    const [input, halfSteps] = k;
    await t.step(
      `${input} + ${halfSteps} halfSteps should be ${v}`,
      () => assertEquals(v, transposePitchClass(input, halfSteps)),
    );
  }
});
