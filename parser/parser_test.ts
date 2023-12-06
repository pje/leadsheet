import {
  assert,
  assertFalse,
  fail,
} from "https://deno.land/std@0.202.0/assert/mod.ts";
import { ParseChord, ParseSong } from "./parser.ts";
import { Bar, Result, Song } from "../types.ts";
import {
  Chord,
  Letter,
  QualityAugmented,
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
const emptySong: Song = {
  title: undefined,
  artist: undefined,
  year: undefined,
  sig: undefined,
  key: "?",
  bars: [],
};

const _emptyBar: Bar = {
  chords: [],
  openBarline: "|",
  closeBarline: "|",
};

function bar(...chords: string[]): Bar {
  return {
    ..._emptyBar,
    chords: chords.map((str: string) =>
      str === "N.C." ? str : ParseChord(str).value!
    ),
  };
}

const songFixtures: Array<{
  title: string;
  contents: string;
  expected: Song;
}> = [
  {
    title: "noChord",
    contents: `| N.C. |`,
    expected: { ...emptySong, key: "?", bars: [bar("N.C.")] },
  },
  {
    title: "oneChord",
    contents: `| C |`,
    expected: { ...emptySong, key: "C", bars: [bar("C")] },
  },
  {
    title: "oneChordNoSpaces",
    contents: `|C|`,
    expected: { ...emptySong, key: "C", bars: [bar("C")] },
  },
  {
    title: "simpleSong",
    contents: `| CM7 | FM7 | Am7 | Dm7 | G7 | C6 |`,
    expected: {
      ...emptySong,
      key: "C",
      bars: [
        bar("CM7"),
        bar("FM7"),
        bar("Am7"),
        bar("Dm7"),
        bar("G7"),
        bar("C6"),
      ],
    },
  },
  {
    title: "repetition",
    contents: `| C | % | D | % |`,
    expected: {
      ...emptySong,
      key: "C",
      bars: [bar("C"), bar("C"), bar("D"), bar("D")],
    },
  },
  {
    title: "barlineRepetition",
    contents: `||: C :| D |2x: C | D :||`,
    expected: {
      ...emptySong,
      key: "C",
      bars: [
        { ...bar("C"), openBarline: "||:", closeBarline: ":|" },
        { ...bar("D"), openBarline: ":|", closeBarline: "|2x:" },
        { ...bar("C"), openBarline: "|2x:", closeBarline: "|" },
        { ...bar("D"), openBarline: "|", closeBarline: ":||" },
      ],
    },
  },
  {
    title: "allLetters",
    contents: `| A | B | C | D | E | F | G | a | c | d | e | f | g |`,
    expected: {
      ...emptySong,
      key: "A",
      bars: [
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
    },
  },
  {
    title: "songWithMetadata",
    contents: `title: my song
artist: some guy
year: 2023

| A | B | C |
`,
    expected: {
      ...emptySong,
      key: "A",
      title: "my song",
      artist: "some guy",
      year: "2023",
      bars: [
        bar("A"),
        bar("B"),
        bar("C"),
      ],
    },
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
    expected: {
      ...emptySong,
      key: "A",
      bars: [
        bar("A"),
        bar("B"),
        bar("C"),
        bar("D"),
      ],
    },
  },
];

Deno.test("empty string: should not parse", () => {
  const result = ParseSong(emptyString);
  assertFalse(!!result.value);
  assert(result.error);
});

Deno.test(`chord symbols`, async (t) => {
  const positiveCases = new Map<string, Chord>([
    [`C5`, new Chord("C", QualityPower)],
    [`C`, new Chord("C", QualityMajor)],
    [`CM`, new Chord("C", QualityMajor)],
    [`Cmaj`, new Chord("C", QualityMajor)],
    [`C6`, new Chord("C", QualityMajor)],
    [`C6/9`, new Chord("C", QualityMajor)],
    [`CM7`, new Chord("C", QualityMajor, "7")],
    [`Cᴹ⁷`, new Chord("C", QualityMajor, "7")],
    [`CM11`, new Chord("C", QualityMajor)],
    [`CM13`, new Chord("C", QualityMajor)],
    [`Cm`, new Chord("C", QualityMinor)],
    [`Cmin`, new Chord("C", QualityMinor)],
    [`Csus`, new Chord("C", QualitySuspended)],
    [`Csus2`, new Chord("C", QualitySuspended)],
    [`Csus4`, new Chord("C", QualitySuspended)],
    [`C7`, new Chord("C", QualityDominant)],
    [`C9`, new Chord("C", QualityDominant)],
    [`C11`, new Chord("C", QualityDominant)],
    [`C13`, new Chord("C", QualityDominant)],
    [`CM7`, new Chord("C", QualityMajor)],
    [`CΔ7`, new Chord("C", QualityMajor)],
    [`Cm7`, new Chord("C", QualityMinor)],
    [`Cm9`, new Chord("C", QualityMinor)],
    [`Cm11`, new Chord("C", QualityMinor)],
    [`Cm13`, new Chord("C", QualityMinor)],
    [`C-7`, new Chord("C", QualityMinor)],
    [`Caug`, new Chord("C", QualityAugmented)],
    [`C⁺`, new Chord("C", QualityAugmented)],
    [`C+`, new Chord("C", QualityAugmented)],
    [`C/D`, new Chord("C", QualityMajor, undefined, "/D")],
    [`Cm/D`, new Chord("C", QualityMinor, undefined, "/D")],
    [`Cm11#13(no5)`, new Chord("C", QualityMinor, undefined, "#13", "(no5)")],
    [
      `F𝄫minMaj9#11(sus4)(no13)(no 5)(omit 5)(♯¹¹)/E`,
      new Chord(
        <Letter> "F𝄫", // TODO: this should be canonicalized to Eb
        QualityMinorMajor,
        "9",
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

        assertEquals(
          expectedChord.tonic!,
          chord.tonic,
          "unexpected chord tonic",
        );

        assertEquals(
          expectedChord.quality!,
          chord.quality,
          "unexpected chord quality",
        );

        assertEquals(
          expectedChord.alterations!,
          chord.alterations,
          "unexpected chord alterations",
        );
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
