import { guessKey, parseSig } from "./song.ts";
import { assertEquals } from "./test_utils.ts";
import { QualityMinor, Song } from "./types.ts";

const songFixture: Song = {
  title: "foo",
  artist: "bar",
  year: "baz",
  sig: "5/4",
  key: "",
  bars: [
    {
      openBarline: "|",
      closeBarline: "|",
      chords: [
        {
          tonic: "C",
          quality: QualityMinor,
          extent: "7",
        },
      ],
    },
  ],
};

Deno.test(parseSig.name, async (t) => {
  const cases = new Map<Song, { numerator: string; denominator: string }>([
    [songFixture, { numerator: "5", denominator: "4" }],
  ]);

  for (const [song, expected] of cases) {
    await t.step(`should parse as ${JSON.stringify(expected)}`, () => {
      const actual = parseSig.bind(song)();
      assertEquals(expected, actual);
    });
  }
});

Deno.test(guessKey.name, async (t) => {
  const cases = new Map<Song, string>([
    [songFixture, "Cm"],
  ]);

  for (const [song, expected] of cases) {
    await t.step(`should guess "${expected}"`, () => {
      const actual = guessKey.bind(song)();
      assertEquals(expected, actual);
    });
  }
});
