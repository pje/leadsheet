// import * as ohm from "./node_modules/ohm-js/index.mjs"; // should work but doesn't! deno bug?
// import * as ohm from "https://unpkg.com/ohm-js@17.1"; // should work but doesn't! ohm bug? (this is how ohm tells us to install it: https://github.com/ohmjs/ohm#deno)
// import * as ohm from "https://unpkg.com/ohm-js@17.1/index.mjs"; // works, but fetches remotely
import * as ohm from "./node_modules/ohm-js/src/main.js"; // works, depends on ./node_modules
import { Grammar } from "./node_modules/ohm-js/index.d.ts";
import { KeyQualifier, Major, Minor } from "./types.ts";
import { CanonicalizeKeyQualifier, ReplaceDupesWithRepeats } from "./utils.ts";
import {
  assert,
  assertEquals,
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

Deno.test("parser: songs dir: sanity check", () => {
  assert(rawSongs.length > 2);
});

const emptyString = ``;

const songs = [
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

Deno.test("parser: empty string: should not parse", () => {
  const match = grammar.match(emptyString);
  assertFalse(match.succeeded());
});

Deno.test(ReplaceDupesWithRepeats.name, () => {
  const input = ["CM", "CM", "CM"];
  const result = ReplaceDupesWithRepeats(input);
  assertEquals(["CM", "/", "/"], result);
});

new Map<string, KeyQualifier>([
  ["M", Major],
  ["major", Major],
  ["Major", Major],
  ["maj", Major],
  ["m", Minor],
  ["minor", Minor],
  ["Minor", Minor],
  ["min", Minor],
]).forEach((v: KeyQualifier, k: string) => {
  Deno.test(
    `${CanonicalizeKeyQualifier.name}: "${k}" should map to "${v}"`,
    () => assertEquals(v, CanonicalizeKeyQualifier(k))
  );
});

[
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
].forEach((c) =>
  Deno.test(`parser: chord: "${c}" should parse as a valid chord`, () =>
    assertGrammarMatch(chordToSong(c))
  )
);

songs.forEach(({ title, contents }) =>
  Deno.test(`parser: song: ${title}: should parse`, () =>
    assertGrammarMatch(contents)
  )
);

rawSongs.forEach(({ name, contents }) => {
  Deno.test(`parser: songs dir: ${name} : should parse`, () =>
    assertGrammarMatch(contents)
  );
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
