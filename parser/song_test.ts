import { Chord, QualityMinor } from "../theory/chord.ts";
import { Song } from "./song.ts";
import { assertEquals } from "../test_utils.ts";

const songFixture = new Song(
  [
    {
      openBarline: "|",
      closeBarline: "|",
      chords: [
        new Chord("C", QualityMinor, 7),
      ],
      name: undefined,
    },
  ],
  {
    title: "foo",
    artist: "bar",
    year: "baz",
    sig: "5/4",
    key: "",
  },
);

Deno.test(Song.prototype.parseSig.name, async (t) => {
  const cases = new Map<Song, { numerator: string; denominator: string }>([
    [songFixture, { numerator: "5", denominator: "4" }],
  ]);

  for (const [song, expected] of cases) {
    await t.step(`should parse as ${JSON.stringify(expected)}`, () => {
      const actual = song.parseSig();
      assertEquals(expected, actual);
    });
  }
});

Deno.test(Song.prototype.guessKey.name, async (t) => {
  const cases = new Map<Song, string>([
    [songFixture, "Cm"],
  ]);

  for (const [song, expected] of cases) {
    await t.step(`should guess "${expected}"`, () => {
      const actual = song.guessKey();
      assertEquals(expected, actual);
    });
  }
});