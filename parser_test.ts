import {
  assert,
  assertFalse,
  fail,
} from "https://deno.land/std@0.202.0/assert/mod.ts";
import { ParseChord, ParseSong } from "./parser.ts";
import {
  Chord,
  ChordQuality,
  Letter,
  QualityAugmented,
  QualityDiminished,
  QualityDominant,
  QualityMajor,
  QualityMinor,
  QualityMinorMajor,
  QualityPower,
  QualitySuspended,
  Result,
} from "./types.ts";
import { assertEquals } from "./test_utils.ts";

const songsDir = "./songs";
const rawSongs: Array<{ name: string; contents: string }> = [];

for await (const songFile of Deno.readDir(`${songsDir}/`)) {
  if (songFile.name.endsWith(".txt")) {
    rawSongs.push({
      name: songFile.name,
      contents: Deno.readTextFileSync(`${songsDir}/${songFile.name}`),
    });
  }
}

const emptyString = ``;

const songFixtures = [
  { title: "oneChord", contents: `| C |` },
  { title: "oneChordNoSpaces", contents: `|C|` },
  { title: "simpleSong", contents: `| CM7 | FM7 | Am7 | Dm7 | G7 | C6 |` },
  { title: "repetition", contents: `| C | % | D | % |` },
  { title: "barlineRepetition", contents: `||: C :| D |2x: C | D :||` },
  {
    title: "allLetters",
    contents: `| A | B | C | D | E | F | G | a | c | d | e | f | g |`,
  },
  {
    title: "songWithMetadata",
    contents: `title: my song
artist: some guy
year: 2023

| A | B | C |
`,
  },
  {
    title: "songWithComments",
    contents: `
| A |
// comment
| B | // comment
// comment
| C
// comment
| D |
`,
  },
];

Deno.test("empty string: should not parse", () => {
  const result = ParseSong(emptyString);
  assertFalse(!!result.value);
  assert(result.error);
});

Deno.test(`chord symbols`, async (t) => {
  const positiveCases = new Map<
    string,
    Pick<Chord, "tonic" | "qualityClass" | "alterations">
  >([
    [`C5`, { tonic: "C", qualityClass: QualityPower, alterations: [] }],
    [`C`, { tonic: "C", qualityClass: QualityMajor, alterations: [] }],
    [`CM`, { tonic: "C", qualityClass: QualityMajor, alterations: [] }],
    [`Cmaj`, { tonic: "C", qualityClass: QualityMajor, alterations: [] }],
    [`C6`, { tonic: "C", qualityClass: QualityMajor, alterations: [] }],
    [`C6/9`, { tonic: "C", qualityClass: QualityMajor, alterations: [] }],
    [`CM7`, { tonic: "C", qualityClass: QualityMajor, alterations: [] }],
    [`CM11`, { tonic: "C", qualityClass: QualityMajor, alterations: [] }],
    [`CM13`, { tonic: "C", qualityClass: QualityMajor, alterations: [] }],
    [`Cm`, { tonic: "C", qualityClass: QualityMinor, alterations: [] }],
    [`Cmin`, { tonic: "C", qualityClass: QualityMinor, alterations: [] }],
    [`Csus`, { tonic: "C", qualityClass: QualitySuspended, alterations: [] }],
    [`Csus2`, { tonic: "C", qualityClass: QualitySuspended, alterations: [] }],
    [`Csus4`, { tonic: "C", qualityClass: QualitySuspended, alterations: [] }],
    [`C7`, { tonic: "C", qualityClass: QualityDominant, alterations: [] }],
    [`C9`, { tonic: "C", qualityClass: QualityDominant, alterations: [] }],
    [`C11`, { tonic: "C", qualityClass: QualityDominant, alterations: [] }],
    [`C13`, { tonic: "C", qualityClass: QualityDominant, alterations: [] }],
    [`CM7`, { tonic: "C", qualityClass: QualityMajor, alterations: [] }],
    [`CΔ7`, { tonic: "C", qualityClass: QualityMajor, alterations: [] }],
    [`Cm7`, { tonic: "C", qualityClass: QualityMinor, alterations: [] }],
    [`Cm9`, { tonic: "C", qualityClass: QualityMinor, alterations: [] }],
    [`Cm11`, { tonic: "C", qualityClass: QualityMinor, alterations: [] }],
    [`Cm13`, { tonic: "C", qualityClass: QualityMinor, alterations: [] }],
    [`C-7`, { tonic: "C", qualityClass: QualityMinor, alterations: [] }],
    [`Cdim7`, { tonic: "C", qualityClass: QualityDiminished, alterations: [] }],
    [`Caug`, { tonic: "C", qualityClass: QualityAugmented, alterations: [] }],
    [`C⁺`, { tonic: "C", qualityClass: QualityAugmented, alterations: [] }],
    [`C+`, { tonic: "C", qualityClass: QualityAugmented, alterations: [] }],
    [`C/D`, { tonic: "C", qualityClass: QualityMajor, alterations: ["/D"] }],
    [`Cm/D`, { tonic: "C", qualityClass: QualityMinor, alterations: ["/D"] }],
    [`Cm11#13(no5)`, {
      tonic: "C",
      qualityClass: QualityMinor,
      alterations: ["#13", "(no5)"],
    }],
    [`F𝄫minMaj9#11(sus4)(no13)(no 5)(omit 5)(♯¹¹)/E`, {
      tonic: "F𝄫" as Letter, // TODO: this should be canonicalized to Eb
      qualityClass: QualityMinorMajor,
      alterations: [
        "#11",
        "(sus4)",
        "(no13)",
        "(no 5)",
        "(omit 5)",
        "(♯¹¹)",
        "/E",
      ],
    }],
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
          expectedChord.qualityClass!,
          chord.qualityClass,
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

  for (const { title, contents } of songFixtures) {
    await t.step(`${title} should parse`, () => assertValidSong(contents));
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
