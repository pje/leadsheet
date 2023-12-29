import { assertEquals } from "../test_utils.ts";
import { Chord, identify, Quality } from "../theory/chord.ts";
import { Power } from "../theory/chord/quality/dyad.ts";
import { Aug, Dim, Maj, Min } from "../theory/chord/quality/triad.ts";
import {
  Aug7,
  Dim7,
  DimM7,
  Dom7,
  Maj6,
  Maj6Sh5,
  Maj7,
  Maj7Sh5,
  Min6,
  Min7,
  Min7Fl5,
  MinMaj7,
} from "../theory/chord/quality/tetrad.ts";
import { colorChord, ColorClass } from "./utils.ts";

Deno.test(colorChord.name, async (t) => {
  const cases = new Map<Quality, ColorClass>([
    [Aug, "aug"],
    [Dim, "dim"],
    [Maj, "maj"],
    [Min, "min"],
    [Maj7, "maj"],
    [Dom7, "dom"],
    [Min7, "min"],
    [Aug7, "dom"],
    [Dim7, "dim"],
    [DimM7, "dim"],
    [Maj7Sh5, "aug"],
    [Min7Fl5, "dim"],
    [MinMaj7, "min"],
    [Maj6, "maj"],
    [Min6, "min"],
    [Maj6Sh5, "aug"],
    [Power, "pow"],
  ]);

  for (const [input, expected] of cases) {
    const chord = new Chord("A", input);
    await t.step(
      `should color ${identify(input)} as ${expected}`,
      () => {
        const result = colorChord(chord);
        assertEquals(expected, result);
      },
    );
  }
});
