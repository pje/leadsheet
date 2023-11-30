import { printChord, transposeChord } from "./chord.ts";
import { assertEquals } from "./test_utils.ts";
import { Chord, FlatOrSharpSymbol, SharpSymbol } from "./types.ts";

Deno.test(transposeChord.name, async (t) => {
  const cases = new Map<[Chord, number, FlatOrSharpSymbol], Chord>([
    [[
      {
        tonic: "A",
        quality: "maj",
        alterations: ["/G"],
      },
      1,
      SharpSymbol,
    ], {
      tonic: "A#",
      quality: "maj",
      alterations: ["/G#"],
    }],
  ]);

  for (const [k, v] of cases) {
    const [input, halfSteps, preferredAccidental] = k;
    await t.step(
      `"${input}" up ${halfSteps} halfSteps (prefer ${preferredAccidental}) should be "${v}"`,
      () =>
        assertEquals(
          v,
          transposeChord.bind(input)(halfSteps, preferredAccidental),
        ),
    );
  }
});

Deno.test(printChord.name, async (t) => {
  const cases = new Map<Chord, string>([
    [{ tonic: "A", quality: "maj" }, "A"],
    [{ tonic: "A", quality: "maj", extent: "6" }, "A6"],
    [{ tonic: "A", quality: "maj", extent: "7" }, "AM7"],
    [{ tonic: "A", quality: "maj", extent: "9" }, "AM9"],
    [{ tonic: "A", quality: "maj", extent: "11" }, "AM11"],
    [{ tonic: "A", quality: "maj", extent: "13" }, "AM13"],
    [{ tonic: "A", quality: "min" }, "Am"],
    [{ tonic: "A", quality: "dim" }, "Ao"],
    [{ tonic: "A", quality: "dom", extent: "7" }, "A7"],
    [{ tonic: "A", quality: "sus", extent: "2" }, "Asus2"],
    [{ tonic: "A", quality: "sus", extent: "4" }, "Asus4"],
  ]);

  for (const [k, v] of cases) {
    const input = k;
    await t.step(
      `"${input}" should be "${v}"`,
      () => assertEquals(v, printChord.bind(input)()),
    );
  }
});
