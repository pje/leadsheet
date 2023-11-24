import {
  assert,
  assertFalse,
  fail,
} from "https://deno.land/std@0.202.0/assert/mod.ts";
import { ParseChord, ParseSong } from "./parser.ts";
import {
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
  const positiveCases = new Map<string, [Letter, ChordQuality]>([
    [`C5`, ["C", QualityPower]],
    [`C`, ["C", QualityMajor]],
    [`CM`, ["C", QualityMajor]],
    [`Cmaj`, ["C", QualityMajor]],
    [`C6`, ["C", QualityMajor]],
    [`C6/9`, ["C", QualityMajor]],
    [`CM7`, ["C", QualityMajor]],
    [`CM11`, ["C", QualityMajor]],
    [`CM13`, ["C", QualityMajor]],
    [`Cm`, ["C", QualityMinor]],
    [`Cmin`, ["C", QualityMinor]],
    [`Csus`, ["C", QualitySuspended]],
    [`Csus2`, ["C", QualitySuspended]],
    [`Csus4`, ["C", QualitySuspended]],
    [`C7`, ["C", QualityDominant]],
    [`C9`, ["C", QualityDominant]],
    [`C11`, ["C", QualityDominant]],
    [`C13`, ["C", QualityDominant]],
    [`CM7`, ["C", QualityMajor]],
    [`CΔ7`, ["C", QualityMajor]],
    [`Cm7`, ["C", QualityMinor]],
    [`Cm9`, ["C", QualityMinor]],
    [`Cm11`, ["C", QualityMinor]],
    [`Cm13`, ["C", QualityMinor]],
    [`C-7`, ["C", QualityMinor]],
    [`Cdim7`, ["C", QualityDiminished]],
    [`Caug`, ["C", QualityAugmented]],
    [`C⁺`, ["C", QualityAugmented]],
    [`C+`, ["C", QualityAugmented]],
    [`Cm11#13(no5)`, ["C", QualityMinor]],
    [`F𝄫minMaj9#11(sus4)(no13)(no 5)(♯¹¹)/E`, [
      "F𝄫" as Letter, // TODO: this should be canonicalized to Eb
      QualityMinorMajor,
    ]],
  ]);
  for (
    const [str, [expectedTonic, expectedQualityClass]] of positiveCases
  ) {
    await t.step(
      `"${str}" should parse as { tonic: "${expectedTonic}", quality: "${expectedQualityClass}" }`,
      () => {
        const chord = parserResultOrFail(ParseChord(str));

        assertEquals(expectedTonic, chord.tonic);
        assertEquals(expectedQualityClass, chord.qualityClass);
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
