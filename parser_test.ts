import * as ohm from "./node_modules/ohm-js/src/main.js"; // works, depends on ./node_modules
import { Grammar } from "./node_modules/ohm-js/index.d.ts";
import {
  assert,
  assertFalse,
  fail,
} from "https://deno.land/std@0.202.0/assert/mod.ts";

const songsDir = "./songs";
const rawSongs: Array<{ name: string; contents: string }> = [];
const grammarText = await Deno.readTextFile("./grammar.ohm");

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
  {
    title: "allLetters",
    contents: `| A | B | C | D | E | F | G | H | a | c | d | e | f | g | h |`,
  },
  {
    title: "songWithMetadata",
    contents: `title: my song
artist: some guy
year: 2023

| A | B | C |
`,
  },
];

const grammar: Grammar = ohm.grammar(grammarText);

Deno.test("empty string: should not parse", () => {
  const match = grammar.match(emptyString);
  assertFalse(match.succeeded());
});

Deno.test(`chord symbols`, async (t) => {
  const cases = [
    `C5`,
    `Cm`,
    `Csus`,
    `Csus2`,
    `Csus4`,
    `C7`,
    `CM7`,
    `CΔ7`,
    `Cm7`,
    `C-7`,
    `Cdim7`,
    `Caug`,
    `C⁺`,
    `C+`,
    `C6/9`,
    `Cm11#13(no5)`,
    `F𝄫minMaj9#11(sus4)(no13)(no 5)(♯¹¹)/E`,
  ];
  for (const c of cases) {
    await t.step(
      `"${c}" should be valid`,
      () => assertGrammarMatch(chordToSong(c)),
    );
  }
});

Deno.test(`songs`, async (t) => {
  await t.step("songs dir: sanity check", () => assert(rawSongs.length > 2));

  for (const { title, contents } of songFixtures) {
    await t.step(`${title} should parse`, () => assertGrammarMatch(contents));
  }

  for (const { name, contents } of rawSongs) {
    await t.step(`${name} should parse`, () => assertGrammarMatch(contents));
  }
});

function assertGrammarMatch(str: string) {
  const match = grammar.match(str);

  if (!match.succeeded()) {
    fail(`grammar failed to match!
  input: ${str}
  failure: ${match.message}`);
  } else {
    assert(true); // Great Job!™
  }
}

function chordToSong(c: string) {
  return `| ${c} |`;
}
