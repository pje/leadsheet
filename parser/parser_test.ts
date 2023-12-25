import {
  assert,
  assertFalse,
} from "https://deno.land/std@0.209.0/assert/mod.ts";
import { ParseChord, ParseSong } from "./parser.ts";
import { type Letter } from "../theory/letter.ts";
import {
  Add6,
  Aug,
  Aug7,
  Chord,
  Dim,
  Dim7,
  DimM7,
  Dom11,
  Dom13,
  Dom7,
  Dom9,
  Maj,
  Maj11,
  Maj13,
  Maj7,
  Min,
  Min11,
  Min13,
  Min7,
  Min7b5,
  Min9,
  MinMaj9,
  Power,
} from "../theory/chord.ts";
import {
  assertEquals,
  bar,
  barWithSection,
  parserResultOrFail,
} from "../test_utils.ts";
import { Song } from "./song.ts";
import { Key } from "../theory/key.ts";
import {
  Add9,
  Everything,
  Lower,
  No,
  Over,
  Raise,
  Sus2,
  Sus4,
} from "../theory/chord/alteration.ts";

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
    title: "optionalChord",
    contents: `| (C) |`,
    expected: new Song([bar("(C)")], { key: new Key("C") }),
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
      [bar("C"), bar("%"), bar("D"), bar("%")],
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
    [`C5`, new Chord("C", Power)],
    [`C`, new Chord("C", Maj)],
    [`CM`, new Chord("C", Maj)],
    [`Cmaj`, new Chord("C", Maj)],
    [`Cmajor`, new Chord("C", Maj)],
    [`C6`, new Chord("C", Maj, Add6)],
    [`C6/9`, new Chord("C", Maj, Add6, Add9)],
    [`Cm6/9`, new Chord("C", Min, Add6, Add9)],
    [`CM7`, new Chord("C", Maj7)],
    [`Cᴹ⁷`, new Chord("C", Maj7)],
    [`CM11`, new Chord("C", Maj11)],
    [`CM13`, new Chord("C", Maj13)],
    [`Cm`, new Chord("C", Min)],
    [`Cmin`, new Chord("C", Min)],
    [`Csus`, new Chord("C", Maj, Sus4)],
    [`Csus2`, new Chord("C", Maj, Sus2)],
    [`Csus4`, new Chord("C", Maj, Sus4)],
    [`Cdom`, new Chord("C", Dom7)],
    [`Cdominant`, new Chord("C", Dom7)],
    [`C7`, new Chord("C", Dom7)],
    [`C9`, new Chord("C", Dom9)],
    [`C11`, new Chord("C", Dom11)],
    [`C13`, new Chord("C", Dom13)],
    [`CM7`, new Chord("C", Maj7)],
    [`CΔ7`, new Chord("C", Maj7)],
    [`Cm`, new Chord("C", Min)],
    [`Cminor`, new Chord("C", Min)],
    [`Cm7`, new Chord("C", Min7)],
    [`Cm9`, new Chord("C", Min9)],
    [`Cm11`, new Chord("C", Min11)],
    [`Cᵐ¹¹`, new Chord("C", Min11)],
    [`Cm13`, new Chord("C", Min13)],
    [`C-7`, new Chord("C", Min7)],
    [`C⁻⁷`, new Chord("C", Min7)],
    [`Cdim`, new Chord("C", Dim)],
    [`Cdiminished`, new Chord("C", Dim)],
    [`Co`, new Chord("C", Dim)],
    [`C°`, new Chord("C", Dim)],
    [`Co7`, new Chord("C", Dim7)],
    [`C°⁷`, new Chord("C", Dim7)],
    [`CoM7`, new Chord("C", DimM7)],
    [`Cø`, new Chord("C", Min7b5)],
    [`Cø7`, new Chord("C", Min7b5)],
    [`Caug`, new Chord("C", Aug)],
    [`Caugmented`, new Chord("C", Aug)],
    [`C⁺`, new Chord("C", Aug)],
    [`C+`, new Chord("C", Aug)],
    [`C⁺7`, new Chord("C", Aug7)],
    [`C+7#9`, new Chord("C", Aug7, Raise(9))],
    [`C/D`, new Chord("C", Maj, Over("D"))],
    [`Cm/D`, new Chord("C", Min, Over("D"))],
    // [`Calt`, new Chord("C", Dom7, Everything(7))], // TODO: `alt` MUST follow 7, otherwise it parses as a Major, not Dominant
    [`C7alt`, new Chord("C", Dom7, Everything(7))],
    [`C7(b13)(b9)`, new Chord("C", Dom7, Lower(13), Lower(9))],
    [`C7b13b9`, new Chord("C", Dom7, Lower(13), Lower(9))],
    [`Cm11#13(no 3)`, new Chord("C", Min11, Raise(13), No(3))],
    [
      `F𝄫minMaj9#11(sus4)(no13)(no 5)(omit 5)(♯¹¹)/E`,
      new Chord(
        <Letter> "F𝄫", // TODO: this should be canonicalized to Eb
        MinMaj9,
        Raise(11),
        Sus4,
        No(13),
        No(5),
        No(5),
        Raise(11),
        Over("E"),
      ),
    ],
  ]);
  for (const [str, expectedChord] of positiveCases) {
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
  assert(_song ? true : false);
}
