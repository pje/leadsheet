import {
  assert,
  assertFalse,
  fail,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ParseChord, ParseSong } from "./parser.ts";
import { Bar, Result, Song } from "../types.ts";
import {
  Chord,
  Letter,
  QualityAugmented,
  QualityDiminished,
  QualityDominant,
  QualityMajor,
  QualityMinor,
  QualityMinorMajor,
  QualityPower,
  QualitySuspended,
} from "../chord.ts";
import { assertEquals } from "../test_utils.ts";

const songsDir = "./songs";
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
    expected: new Song([bar("N.C.")], { key: "?" }),
  },
  {
    title: "oneChord",
    contents: `| C |`,
    expected: new Song([bar("C")], { key: "C" }),
  },
  {
    title: "Sectional",
    contents: `Verse:
| C | D |

Chorus:
| Am | Bm| `,
    expected: new Song([
      barWithSection("Verse", "C"),
      barWithSection("Verse", "D"),
      barWithSection("Chorus", "Am"),
      barWithSection("Chorus", "Bm"),
    ], { key: "C" }),
  },
  {
    title: "oneChordNoSpaces",
    contents: `|C|`,
    expected: new Song([bar("C")], { key: "C" }),
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
      { key: "C" },
    ),
  },
  {
    title: "repetition",
    contents: `| C | % | D | % |`,
    expected: new Song(
      [bar("C"), bar("C"), bar("D"), bar("D")],
      { key: "C" },
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
      { key: "C" },
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
      { key: "A" },
    ),
  },
  {
    title: "songWithMetadata",
    contents: `title: my song
artist: some guy
year: 2023

| A | B | C |
`,
    expected: new Song(
      [
        bar("A"),
        bar("B"),
        bar("C"),
      ],
      { key: "A", title: "my song", artist: "some guy", year: "2023" },
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
      { key: "A" },
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
      { key: "A" },
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
    [`C5`, new Chord("C", QualityPower, 5)],
    [`C`, new Chord("C", QualityMajor)],
    [`CM`, new Chord("C", QualityMajor)],
    [`Cmaj`, new Chord("C", QualityMajor)],
    [`Cmajor`, new Chord("C", QualityMajor)],
    [`C6`, new Chord("C", QualityMajor, 6)],
    [`C6/9`, new Chord("C", QualityMajor, 6, "(add 9)")],
    [`C69`, new Chord("C", QualityMajor, 6, "(add 9)")],
    [`Cm6/9`, new Chord("C", QualityMinor, 6, "(add 9)")],
    [`CM7`, new Chord("C", QualityMajor, 2)],
    [`Cᴹ⁷`, new Chord("C", QualityMajor, 7)],
    [`CM11`, new Chord("C", QualityMajor, 11)],
    [`CM13`, new Chord("C", QualityMajor, 13)],
    [`Cm`, new Chord("C", QualityMinor)],
    [`Cmin`, new Chord("C", QualityMinor)],
    [`Csus`, new Chord("C", QualitySuspended)],
    [`Csus2`, new Chord("C", QualitySuspended, 2)],
    [`Csus4`, new Chord("C", QualitySuspended, 4)],
    [`Cdom`, new Chord("C", QualityDominant, 7)],
    [`Cdominant`, new Chord("C", QualityDominant, 7)],
    [`C7`, new Chord("C", QualityDominant, 7)],
    [`C9`, new Chord("C", QualityDominant, 9)],
    [`C11`, new Chord("C", QualityDominant, 11)],
    [`C13`, new Chord("C", QualityDominant, 13)],
    [`CM7`, new Chord("C", QualityMajor, 7)],
    [`CΔ7`, new Chord("C", QualityMajor, 7)],
    [`Cm`, new Chord("C", QualityMinor)],
    [`Cminor`, new Chord("C", QualityMinor)],
    [`Cm7`, new Chord("C", QualityMinor, 7)],
    [`Cm9`, new Chord("C", QualityMinor, 9)],
    [`Cm11`, new Chord("C", QualityMinor, 11)],
    [`Cᵐ¹¹`, new Chord("C", QualityMinor, 11)],
    [`Cm13`, new Chord("C", QualityMinor, 13)],
    [`C-7`, new Chord("C", QualityMinor, 7)],
    [`C⁻⁷`, new Chord("C", QualityMinor, 7)],
    [`Cdim`, new Chord("C", QualityDiminished)],
    [`Cdiminished`, new Chord("C", QualityDiminished)],
    [`Co`, new Chord("C", QualityDiminished)],
    [`C°`, new Chord("C", QualityDiminished)],
    [`Co7`, new Chord("C", QualityDiminished, 7)],
    [`C°⁷`, new Chord("C", QualityDiminished, 7)],
    [`Cø`, new Chord("C", QualityMinor, 7, "b5")],
    [`Cø7`, new Chord("C", QualityMinor, 7, "b5")],
    [`Caug`, new Chord("C", QualityAugmented)],
    [`Caugmented`, new Chord("C", QualityAugmented)],
    [`C⁺`, new Chord("C", QualityAugmented)],
    [`C+`, new Chord("C", QualityAugmented)],
    [`C⁺7`, new Chord("C", QualityAugmented, 7)],
    [`C+7#9`, new Chord("C", QualityAugmented, 7, "#9")],
    [`C/D`, new Chord("C", QualityMajor, undefined, "/D")],
    [`Cm/D`, new Chord("C", QualityMinor, undefined, "/D")],
    [`Cm11#13(no5)`, new Chord("C", QualityMinor, 11, "#13", "(no5)")],
    [
      `F𝄫minMaj9#11(sus4)(no13)(no 5)(omit 5)(♯¹¹)/E`,
      new Chord(
        <Letter> "F𝄫", // TODO: this should be canonicalized to Eb
        QualityMinorMajor,
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
    ``,
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

  assert(true); // Great Job!™
}

function parserResultOrFail<T>(result: Result<T>): T {
  if (result.error) {
    fail(`grammar failed to match!
  failure: ${result.error.message}`);
  } else {
    return result.value;
  }
}
