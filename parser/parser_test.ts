import {
  assert,
  assertFalse,
  fail,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ParseChord, ParseSong } from "./parser.ts";
import { type Letter } from "../theory/letter.ts";
import { type Result } from "../lib/result.ts";
import {
  Augmented,
  Chord,
  Diminished,
  Dominant,
  Major,
  Minor,
  MinorMajor,
  Power,
  Suspended,
} from "../theory/chord.ts";
import { assertEquals } from "../test_utils.ts";
import { Bar, Song } from "./song.ts";
import { Key } from "../theory/key.ts";

const songsDir = "./leadsheets";
const rawSongs: Array<{ name: string; contents: string }> = [];

for await (const songFile of Deno.readDir(`${songsDir}/`)) {
  if (songFile.name.endsWith(".leadsheet")) {
    rawSongs.push({
      name: songFile.name,
      contents: Deno.readTextFileSync(`${songsDir}/${songFile.name}`),
    });
  }
}

const emptyString = ``;
const _emptyBar: Bar = {
  chords: [],
  openBarline: "|",
  closeBarline: "|",
  name: undefined,
};

function bar(...chords: string[]): Bar {
  return {
    ..._emptyBar,
    chords: chords.map((str: string) =>
      str === "N.C." ? str : ParseChord(str).value!
    ),
  };
}

function barWithSection(section: string, ...chords: string[]): Bar {
  return { ...bar(...chords), name: section };
}

const songFixtures: Array<{
  title: string;
  contents: string;
  expected: Song;
}> = [
  {
    title: "noChord",
    contents: `| N.C. |`,
    expected: new Song([bar("N.C.")], { key: undefined }),
  },
  {
    title: "oneChord",
    contents: `| C |`,
    expected: new Song([bar("C")], { key: new Key("C") }),
  },
  {
    title: "Sectional",
    contents: `A:
| C | D |

Chorus:
| Am | Bm| `,
    expected: new Song([
      barWithSection("A", "C"),
      barWithSection("A", "D"),
      barWithSection("Chorus", "Am"),
      barWithSection("Chorus", "Bm"),
    ], { key: new Key("C") }),
  },
  {
    title: "oneChordNoSpaces",
    contents: `|C|`,
    expected: new Song([bar("C")], { key: new Key("C") }),
  },
  {
    title: "simpleSong",
    contents: `| CM7 | FM7 | Am7 | Dm7 | G7 | C6 |`,
    expected: new Song(
      [
        bar("CM7"),
        bar("FM7"),
        bar("Am7"),
        bar("Dm7"),
        bar("G7"),
        bar("C6"),
      ],
      { key: new Key("C") },
    ),
  },
  {
    title: "repetition",
    contents: `| C | % | D | % |`,
    expected: new Song(
      [bar("C"), bar("C"), bar("D"), bar("D")],
      { key: new Key("C") },
    ),
  },
  {
    title: "barlineRepetition",
    contents: `||: C :| D |2x: C | D :||`,
    expected: new Song(
      [
        { ...bar("C"), openBarline: "||:", closeBarline: ":|" },
        { ...bar("D"), openBarline: ":|", closeBarline: "|2x:" },
        { ...bar("C"), openBarline: "|2x:", closeBarline: "|" },
        { ...bar("D"), openBarline: "|", closeBarline: ":||" },
      ],
      { key: new Key("C") },
    ),
  },
  {
    title: "allLetters",
    contents: `| A | B | C | D | E | F | G | a | c | d | e | f | g |`,
    expected: new Song(
      [
        bar("A"),
        bar("B"),
        bar("C"),
        bar("D"),
        bar("E"),
        bar("F"),
        bar("G"),
        bar("A"),
        bar("C"),
        bar("D"),
        bar("E"),
        bar("F"),
        bar("G"),
      ],
      { key: new Key("A") },
    ),
  },
  {
    title: "songWithMetadata",
    contents: `title: my song
artist: some guy
album: tri repetae.
year: 2023

| A | B | C |
`,
    expected: new Song(
      [
        bar("A"),
        bar("B"),
        bar("C"),
      ],
      {
        key: new Key("A"),
        title: "my song",
        artist: "some guy",
        album: "tri repetae.",
        year: "2023",
      },
    ),
  },
  {
    title: "songWithComments",
    contents: `
| A |
// comment
| B | // comment
// comment
| C |
// comment
| D |
`,
    expected: new Song(
      [
        bar("A"),
        bar("B"),
        bar("C"),
        bar("D"),
      ],
      { key: new Key("A") },
    ),
  },
  {
    title: "songWithRepeatBarlines",
    contents: `
||: A | B  :2x||
|: Cm | Dm :3x||`,
    expected: new Song(
      [
        { ...bar("A"), openBarline: "||:", closeBarline: "|" },
        { ...bar("B"), openBarline: "|", closeBarline: ":2x||" },
        { ...bar("Cm"), openBarline: "|:", closeBarline: "|" },
        { ...bar("Dm"), openBarline: "|", closeBarline: ":3x||" },
      ],
      { key: new Key("A") },
    ),
  },
];

Deno.test("empty string: should not parse", () => {
  const result = ParseSong(emptyString);
  assertFalse(!!result.value);
  assert(result.error);
});

Deno.test(`chord symbols`, async (t) => {
  const positiveCases = new Map<string, Chord>([
    [`C5`, new Chord("C", Power, 5)],
    [`C`, new Chord("C", Major)],
    [`CM`, new Chord("C", Major)],
    [`Cmaj`, new Chord("C", Major)],
    [`Cmajor`, new Chord("C", Major)],
    [`C6`, new Chord("C", Major, 6)],
    [`C6/9`, new Chord("C", Major, 6, "(add 9)")],
    [`C69`, new Chord("C", Major, 6, "(add 9)")],
    [`Cm6/9`, new Chord("C", Minor, 6, "(add 9)")],
    [`CM7`, new Chord("C", Major, 2)],
    [`Cᴹ⁷`, new Chord("C", Major, 7)],
    [`CM11`, new Chord("C", Major, 11)],
    [`CM13`, new Chord("C", Major, 13)],
    [`Cm`, new Chord("C", Minor)],
    [`Cmin`, new Chord("C", Minor)],
    [`Csus`, new Chord("C", Suspended)],
    [`Csus2`, new Chord("C", Suspended, 2)],
    [`Csus4`, new Chord("C", Suspended, 4)],
    [`Cdom`, new Chord("C", Dominant, 7)],
    [`Cdominant`, new Chord("C", Dominant, 7)],
    [`C7`, new Chord("C", Dominant, 7)],
    [`C9`, new Chord("C", Dominant, 9)],
    [`C11`, new Chord("C", Dominant, 11)],
    [`C13`, new Chord("C", Dominant, 13)],
    [`CM7`, new Chord("C", Major, 7)],
    [`CΔ7`, new Chord("C", Major, 7)],
    [`Cm`, new Chord("C", Minor)],
    [`Cminor`, new Chord("C", Minor)],
    [`Cm7`, new Chord("C", Minor, 7)],
    [`Cm9`, new Chord("C", Minor, 9)],
    [`Cm11`, new Chord("C", Minor, 11)],
    [`Cᵐ¹¹`, new Chord("C", Minor, 11)],
    [`Cm13`, new Chord("C", Minor, 13)],
    [`C-7`, new Chord("C", Minor, 7)],
    [`C⁻⁷`, new Chord("C", Minor, 7)],
    [`Cdim`, new Chord("C", Diminished)],
    [`Cdiminished`, new Chord("C", Diminished)],
    [`Co`, new Chord("C", Diminished)],
    [`C°`, new Chord("C", Diminished)],
    [`Co7`, new Chord("C", Diminished, 7)],
    [`C°⁷`, new Chord("C", Diminished, 7)],
    [`CoM7`, new Chord("C", Diminished, undefined, "M7")],
    [`Cø`, new Chord("C", Minor, 7, "b5")],
    [`Cø7`, new Chord("C", Minor, 7, "b5")],
    [`Caug`, new Chord("C", Augmented)],
    [`Caugmented`, new Chord("C", Augmented)],
    [`C⁺`, new Chord("C", Augmented)],
    [`C+`, new Chord("C", Augmented)],
    [`C⁺7`, new Chord("C", Augmented, 7)],
    [`C+7#9`, new Chord("C", Augmented, 7, "#9")],
    [`C/D`, new Chord("C", Major, undefined, "/D")],
    [`Cm/D`, new Chord("C", Minor, undefined, "/D")],
    [`Calt`, new Chord("C", Dominant, undefined, "alt")],
    [`C7alt`, new Chord("C", Dominant, 7, "alt")],
    [`Cm11#13(no 3)`, new Chord("C", Minor, 11, "#13", "(no 3)")],
    [
      `F𝄫minMaj9#11(sus4)(no13)(no 5)(omit 5)(♯¹¹)/E`,
      new Chord(
        <Letter> "F𝄫", // TODO: this should be canonicalized to Eb
        MinorMajor,
        9,
        "#11",
        "(sus4)",
        "(no13)",
        "(no 5)",
        "(omit 5)",
        "(♯¹¹)",
        "/E",
      ),
    ],
  ]);
  for (
    const [str, expectedChord] of positiveCases
  ) {
    await t.step(
      `"${str}" should parse as ${JSON.stringify(expectedChord)}`,
      () => {
        const chord = parserResultOrFail(ParseChord(str));
        assertEquals(expectedChord, chord);
      },
    );
  }

  const negativeCases = [
    `C 7`, // can't allow spaces after the tonic
    `wat`,
    `Hm7`,
    `C Minor`, // can't allow spaces after the tonic
  ];
  for (const c of negativeCases) {
    await t.step(
      `"${c}" should be invalid`,
      () => {
        const result = ParseChord(c);
        assertFalse(!!result.value);
        assert(result.error);
      },
    );
  }
});

Deno.test(`songs`, async (t) => {
  await t.step("songs dir: sanity check", () => assert(rawSongs.length > 2));

  for (const { title, contents, expected } of songFixtures) {
    await t.step(
      `${title} should parse as valid`,
      () => assertValidSong(contents),
    );
    await t.step(
      `${title} should parse to the expected song`,
      () => assertEquals(expected, parserResultOrFail(ParseSong(contents))),
    );
  }

  for (const { name, contents } of rawSongs) {
    await t.step(`${name} should parse`, () => assertValidSong(contents));
  }
});

function assertValidSong(str: string) {
  const _song = parserResultOrFail(ParseSong(str));

  if (_song) {
    assert(true); // Great Job!™
  } else {
    assert(false);
  }
}

function parserResultOrFail<T>(result: Result<T>): T {
  if (result.error) {
    fail(`grammar failed to match!
  failure: ${result.error.message}`);
  } else {
    return result.value;
  }
}
