import { AccidentalList, Key, Major, Minor } from "./key.ts";
import { assertEquals } from "../test_utils.ts";
import { FlatOrSharpSymbol, FlatSymbol, SharpSymbol } from "./notation.ts";
import { Letter } from "./letter.ts";

const someUnknownKeyName = "phrygian oblique or whatever";

Deno.test("constructor: canonicalizes major/minor strings", async (t) => {
  const cases = new Map<[Letter, string], Key>([
    [["A", ""], new Key("A", Major)],
    [["A", "M"], new Key("A", Major)],
    [["A", "major"], new Key("A", Major)],
    [["A", "Major"], new Key("A", Major)],
    [["A", "maj"], new Key("A", Major)],
    [["A", "m"], new Key("A", Minor)],
    [["A", "minor"], new Key("A", Minor)],
    [["A", "Minor"], new Key("A", Minor)],
    [["A", "min"], new Key("A", Minor)],
  ]);
  for (const [[tonic, flavor], expected] of cases) {
    await t.step(
      `"Key(${tonic}, ${flavor})" ⇒ "${JSON.stringify(expected)}"`,
      () => assertEquals(expected, new Key(tonic, flavor)),
    );
  }
});

Deno.test("constructor: conventionalizes Letters (implicit major)", async (t) => {
  const cases = new Map<Letter, Letter>([
    ["A", "A"],
    ["A#", "Bb"], // prefer BbM to A#M
    ["Bb", "Bb"], // prefer BbM to A#M
    ["B", "B"],
    ["B#", "C"],
    ["Cb", "B"],
    ["C", "C"],
    ["C#", "Db"], // prefer DbM to C#M
    ["C#", "Db"], // prefer DbM to C#M
    ["D", "D"],
    ["D#", "Eb"],
    ["Eb", "Eb"],
    ["E", "E"],
    ["E#", "F"],
    ["Fb", "E"],
    ["F", "F"],
    ["F#", "F#"], // ambiguous, so no transform
    ["Gb", "Gb"], // ambiguous, so no transform
    ["G", "G"],
    ["G#", "Ab"],
    ["Ab", "Ab"],
  ]);
  for (const [tonic, expectedTonic] of cases) {
    const key = new Key(tonic);
    await t.step(
      `new Key(${tonic}).tonic ⇒ "${expectedTonic}"`,
      () => assertEquals(expectedTonic, key.tonic),
    );
  }
});

Deno.test("constructor: conventionalizes Letters (explicit minor)", async (t) => {
  const cases = new Map<[Letter, string], Letter>([
    [["A", "m"], "A"],
    [["A#", "m"], "Bb"], // prefer Bbm to A#m
    [["Bb", "m"], "Bb"],
    [["B", "m"], "B"],
    [["B#", "m"], "C"],
    [["Cb", "m"], "B"],
    [["C", "m"], "C"],
    [["C#", "m"], "C#"],
    [["Db", "m"], "C#"],
    [["D", "m"], "D"],
    [["D#", "m"], "D#"], // ambiguous, so no transform
    [["Eb", "m"], "Eb"], // ambiguous, so no transform
    [["E", "m"], "E"],
    [["E#", "m"], "F"],
    [["Fb", "m"], "E"],
    [["F", "m"], "F"],
    [["F#", "m"], "F#"],
    [["Gb", "m"], "F#"],
    [["G", "m"], "G"],
    [["G#", "m"], "G#"],
    [["Ab", "m"], "G#"], // prefer G#m to Abm
  ]);
  for (const [[tonic, flavor], expectedTonic] of cases) {
    const key = new Key(tonic, flavor);
    await t.step(
      `new Key(${tonic}).tonic ⇒ "${expectedTonic}"`,
      () => assertEquals(expectedTonic, key.tonic),
    );
  }
});

Deno.test(Key.prototype.transpose.name, async (t) => {
  const cases = new Map<[Key, number], Key>([
    [[new Key("A", Major), 1], new Key("A#", Major)],
    [
      [new Key("A", someUnknownKeyName), 2],
      new Key("B", someUnknownKeyName),
    ],
  ]);

  for (const [[k, halfSteps], v] of cases) {
    await t.step(`${k} ⇒ ${v}`, () => {
      assertEquals(v, k.transpose(halfSteps));
    });
  }
});

Deno.test(Key.prototype.accidentalPreference.name, async (t) => {
  const cases = new Map<Key, FlatOrSharpSymbol | undefined>([
    [new Key("C", Major), undefined],
    [new Key("A", Minor), undefined],
    [new Key("A", Major), SharpSymbol],
    [new Key("C", Minor), FlatSymbol],
    [new Key("G#", Minor), SharpSymbol], // G#m
    [new Key("Ab", Minor), SharpSymbol], // G#m is more conventional than Abm (five sharps vs six flats), so we should pick G#m
    [new Key("A", someUnknownKeyName), undefined], // better to show no sharps or flats if we don't explicitly know the scale
  ]);

  for (const [k, expected] of cases) {
    await t.step(`${k.format()} ⇒ ${expected}`, () => {
      assertEquals(expected, k.accidentalPreference());
    });
  }
});

Deno.test(Key.prototype.signature.name, async (t) => {
  const cases = new Map<Key, AccidentalList>([
    [new Key("C", Major), []],
    [new Key("A", Minor), []],
    [new Key("A", Major), ["F#", "C#", "G#"]],
    [new Key("F#", Minor), ["F#", "C#", "G#"]],
    [new Key("C", Minor), ["Bb", "Eb", "Ab"]],
    [new Key("G#", Minor), ["F#", "C#", "G#", "D#", "A#"]], // G#m
    [new Key("Ab", Minor), ["F#", "C#", "G#", "D#", "A#"]], // G#m is more conventional than Abm (five sharps vs six flats), so we should pick G#m

    [new Key("A", someUnknownKeyName), []], // better to show no sharps or flats if we don't explicitly know the scale
  ]);

  for (const [k, expected] of cases) {
    await t.step(`${JSON.stringify(k)} ⇒ ${expected}`, () => {
      assertEquals(expected, k.signature());
    });
  }
});
