import { assertEquals } from "../../test_utils.ts";
import { Chord } from "../../theory/chord.ts";
import {
  Add6,
  Add9,
  No,
  Over,
  Raise,
  Sus2,
  Sus4,
} from "../../theory/chord/alteration.ts";
import { Power } from "../../theory/chord/quality/dyad.ts";
import {
  Aug7,
  Dim7,
  DimM7,
  Dom11,
  Dom13,
  Dom7,
  Dom9,
  Maj11,
  Maj13,
  Maj6,
  Maj69,
  Maj7,
  Maj7Sh5,
  Maj9,
  Min11,
  Min13,
  Min6,
  Min69,
  Min7,
  Min7Fl5,
  Min9,
  MinMaj7,
} from "../../theory/chord/quality/tetrad.ts";
import { Aug, Dim, Maj, Min } from "../../theory/chord/quality/triad.ts";
import { TextFormatter } from "./text_formatter.ts";

export const CommonCases = new Map<Chord, string>([
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
  [new Chord("A", Min, Add6, Add9), "Am6/9"],
  [new Chord("A", Maj6), "A6"],
  [new Chord("A", Min6), "Am6"],
  [new Chord("A", Maj69), "A6/9"],
  [new Chord("A", Min69), "Am6/9"],
  [new Chord("A", Maj, Sus2), "Asus2"],
  [new Chord("A", Maj, Sus4), "Asus4"],
  [new Chord("A", Maj, Raise(9)), "A#9"],
  [new Chord("A", Maj, Over("G")), "A/G"],
  [new Chord("A", Maj, Over("Gb")), "A/Gb"],
  [new Chord("A", Maj, Over("F#")), "A/F#"],
]);

Deno.test(TextFormatter.prototype.format.name, async (t) => {
  for (const [input, expected] of CommonCases) {
    await t.step(
      `should format ${JSON.stringify(input)} as ${expected}`,
      () => {
        const result = new TextFormatter(input).format();
        assertEquals(expected, result);
      },
    );
  }

  const cases = new Map<Chord, string>([
    [new Chord("A", Aug7, Raise(9), No(3)), "A+7#9(no3)"],
  ]);
  for (const [input, expected] of cases) {
    await t.step(
      `should format ${JSON.stringify(input)} as ${expected}`,
      () => {
        const result = new TextFormatter(input).format();
        assertEquals(expected, result);
      },
    );
  }
});
