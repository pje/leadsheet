import { Chord, Dom9, Maj, Min7 } from "../theory/chord.ts";
import { MetadataKeys, Song } from "./song.ts";
import { assertEquals, bar } from "../test_utils.ts";
import { Key, KeyFlavorMajor, KeyFlavorMinor } from "../theory/key.ts";
import { Letter } from "../theory/letter.ts";
import { Add6, Add9 } from "../theory/chord/alteration.ts";

const songFixture = new Song(
  [
    {
      openBarline: "||",
      closeBarline: "|",
      chords: [
        new Chord("C", Min7),
        new Chord("F", Min7),
      ],
      name: "Verse",
    },
    {
      openBarline: "|",
      closeBarline: "||",
      chords: [
        new Chord("Bb", Maj, Add6, Add9),
        new Chord("Eb", Dom9),
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
    key: new Key("E", "m"),
  },
);

const songWithContradictoryKeyMetadata = new Song(
  [bar("C")],
  { key: new Key("B", "M") },
);

const songWithNonconventionalKeyMetadataSpelling = new Song(
  [bar("N.C.")],
  { key: new Key("B#", "mInOr") },
);

const songWithNoKeyMetadata = new Song(
  [bar("Dbm")],
  {},
);

const songWithNoChords = new Song(
  [bar("N.C.")],
  {},
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

Deno.test("constructor: guessKey", async (t) => {
  const cases = new Map<Song, Key | undefined>([
    [songWithContradictoryKeyMetadata, new Key("B", KeyFlavorMajor)],
    [songWithNonconventionalKeyMetadataSpelling, new Key("C", KeyFlavorMinor)],
    [songWithNoKeyMetadata, new Key("Db", KeyFlavorMinor)],
    [songWithNoChords, undefined],
  ]);

  for (const [song, expected] of cases) {
    await t.step(`should guess "${expected}"`, () => {
      assertEquals(expected, song.key);
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

Deno.test(Song.prototype.transpose.name, async (t) => {
  const songInCMajor = new Song([bar("C")], { key: new Key("C") });

  const cases = new Map<[Song, number], Letter>([
    [[songInCMajor, -4], "Ab"],
    [[songInCMajor, -3], "A"],
    [[songInCMajor, -2], "Bb"],
    [[songInCMajor, -1], "B"],
    [[songInCMajor, 0], "C"],
    [[songInCMajor, 1], "Db"],
    [[songInCMajor, 2], "D"],
    [[songInCMajor, 3], "Eb"],
    [[songInCMajor, 4], "E"],
    [[songInCMajor, 5], "F"],
    [[songInCMajor, 6], "F#"], // ambiguous
    [[songInCMajor, 7], "G"],
    [[songInCMajor, 8], "Ab"],
    [[songInCMajor, 9], "A"],
    [[songInCMajor, 10], "Bb"],
    [[songInCMajor, 11], "B"],
    [[songInCMajor, 12], "C"],
  ]);

  for (const [[song, halfSteps], expected] of cases) {
    await t.step(
      `song in ${song.key?.format()} should transpose(${halfSteps}) to ${expected}`,
      () => {
        const actual = song.transpose(halfSteps).key?.tonic;
        assertEquals(expected, actual);
      },
    );
  }
});
