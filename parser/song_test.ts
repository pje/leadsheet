import { Chord, Dominant, Major, Minor } from "../theory/chord.ts";
import { MetadataKeys, Song } from "./song.ts";
import { assertEquals } from "../test_utils.ts";

const songFixture = new Song(
  [
    {
      openBarline: "||",
      closeBarline: "|",
      chords: [
        new Chord("C", Minor, 7),
        new Chord("F", Minor, 7),
      ],
      name: "Verse",
    },
    {
      openBarline: "|",
      closeBarline: "||",
      chords: [
        new Chord("Bb", Major, 6, "(add 9)"),
        new Chord("Eb", Dominant, 9),
      ],
      name: "Chorus",
    },
  ],
  {
    title: "foo",
    artist: "bar",
    album: "qux",
    year: "baz",
    sig: "5/4",
    key: "Em",
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

  for (const [s, expected] of cases) {
    const song = s.dup();
    song.key = "";

    await t.step(`should guess "${expected}"`, () => {
      const actual = song.guessKey();
      assertEquals(expected, actual);
    });
  }
});

Deno.test(Song.prototype.dup.name, async (t) => {
  const cases = [songFixture];

  for (const song of cases) {
    await t.step(`should dup to itself`, () => {
      const dupped = song.dup();

      for (const k of MetadataKeys) {
        assertEquals(song[k], dupped[k]);
      }

      assertEquals(song.bars, dupped.bars);

      assertEquals(song, dupped);
    });
  }
});

Deno.test(Song.prototype.format.name, async (t) => {
  const cases = new Map<Song, string>([
    [
      songFixture,
      `title: foo
artist: bar
year: baz
sig: 5/4
key: Em

Verse:
|| Cm7 Fm7 |

Chorus:
| Bb6/9 Eb9 ||
`,
    ],
  ]);

  for (const [song, expected] of cases) {
    await t.step(`should pretty-format the song`, () => {
      const actual = song.format();
      assertEquals(expected, actual);
    });
  }
});
