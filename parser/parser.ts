// @deno-types="./grammar.ohm-bundle.d.ts"
import grammar from "./grammar.ohm-bundle.js";
import {
  type IterationNode as INode,
  type Node,
  type NonterminalNode as NNode,
  type TerminalNode as TNode,
} from "ohm-js";
import {
  type ChordActionDict,
  type SongActionDict,
} from "./grammar.ohm-bundle.js";
import { zip } from "../lib/array.ts";
import {
  Add9,
  Augmented,
  Chord,
  Diminished,
  Dominant,
  type Extent,
  Major,
  Minor,
  MinorMajor,
  Power,
  type Quality,
  Suspended,
} from "../theory/chord.ts";
import {
  AllRepeatedChordSymbols,
  type Bar,
  type Barline,
  type Chordish,
  type MetadataKeysType,
  NoChord,
  Song,
} from "./song.ts";
import { Err, Ok, type Result } from "../lib/result.ts";
import { KeyFromString } from "../theory/key.ts";

class ChordActions implements ChordActionDict<void> {
  chord = (root: NNode, flavor: NNode) =>
    new Chord(root.eval(), ...(flavor.eval()));

  root = (root: NNode, accidentals: INode) =>
    [
      normalizeLetter(root.sourceString),
      normalizeAccidentals(accidentals.sourceString),
    ].join("");

  flavor = (qualityNode: INode, extentNode: INode, alterationsNodes: INode) => {
    const [q, e, a]: [
      Quality | undefined,
      Extent | undefined,
      string[],
    ] = isImplicitPower(qualityNode, extentNode)
      ? [Power, undefined, []]
      : isImplicitMajor(qualityNode, extentNode, alterationsNodes)
      ? [Major, undefined, []]
      : isImplicitDominant(qualityNode, extentNode, alterationsNodes)
      ? [Dominant, undefined, []]
      : qualityNode.child(0)?.eval();

    const [q2, e2, a2]: [
      Quality | undefined,
      Extent | undefined,
      string[],
    ] = extentNode.child(0)?.eval() || [undefined, undefined, []];

    const alterations = alterationsNodes.children.map((a) => a.sourceString);

    return [q2 || q, e2 || e, ...a, ...a2, ...alterations];
  };

  #evalPassthrough = (n: NNode) => n.eval();
  #extentPassthrough =
    (extent: Extent) => (_: NNode) => [undefined, extent, []];

  extent = this.#evalPassthrough;
  thirteen = this.#extentPassthrough(13);
  eleven = this.#extentPassthrough(11);
  nine = this.#extentPassthrough(9);
  seven = this.#extentPassthrough(7);
  six = this.#extentPassthrough(6);
  five = this.#extentPassthrough(5);
  four = this.#extentPassthrough(4);
  two = this.#extentPassthrough(2);
  six_and_nine = (_0: NNode, _1: INode, _2: NNode) => [undefined, 6, [Add9]];

  #qualityPassthrough =
    (quality: Quality) => (_: NNode) => [quality, undefined, []];
  quality = this.#evalPassthrough;
  augmented = this.#qualityPassthrough(Augmented);
  diminished = this.#qualityPassthrough(Diminished);
  major = this.#qualityPassthrough(Major);
  minor = this.#qualityPassthrough(Minor);
  sus = this.#qualityPassthrough(Suspended);
  dominant = (_0: NNode) => [Dominant, 7, []];
  half_diminished = (_0: NNode) => [Minor, 7, ["b5"]];
  minor_major = (_0: NNode) => [MinorMajor, 7, []];
  minor_major_with_parens = (
    arg0: NNode,
    _1: TNode,
    _2: NNode,
    _3: NNode,
    _4: NNode,
  ) => this.minor_major(arg0);
}

class SongActions extends ChordActions implements SongActionDict<void> {
  #s: Song;
  #currentSection: string | undefined;

  constructor(s: Song) {
    super();
    this.#s = s;
    this.#currentSection = undefined;
  }

  Song = (metadata: INode, bars: NNode) => {
    metadata.children.forEach((e) => e.eval());
    bars.eval();
    return this.#s;
  };

  Sections = (maybeSection: INode, bars: INode) => {
    zip(maybeSection.children, bars.children).forEach(([section, bars2]) => {
      section.children.forEach((c2) => c2.eval());
      bars2.eval();
    });
  };

  Section = (sectionName: INode, _1: INode) => {
    // TODO: get rid of the statefulness here
    this.#currentSection = sectionName.sourceString;
  };

  Bars = (barline: NNode, barChords: INode, closingBarlines: INode) => {
    let previousChord: Chordish | undefined = undefined;
    let previousBarline = barline.sourceString;

    zip(barChords.children, closingBarlines.children).forEach(
      ([barNode, closingBarlineNode]) => {
        const chords = barNode.children.map(
          (chordishNode) => {
            const chordString = chordishNode.sourceString.trim();

            if (chordString === NoChord) {
              previousChord = NoChord;
            } else if (!isRepeat(chordString)) {
              previousChord = chordishNode.eval();
            }

            return previousChord === NoChord ? NoChord : previousChord!.dup();
          },
        );

        const thisBarline = closingBarlineNode.children.map((c) =>
          c.sourceString
        ).join("");

        const bar: Bar = {
          openBarline: <Barline> previousBarline,
          closeBarline: <Barline> thisBarline,
          name: this.#currentSection,
          chords,
        };
        previousBarline = thisBarline;
        this.#s.bars.push(bar);
      },
    );
  };

  meta = (
    arg0: Node,
    _arg1: TNode,
    _arg2: INode,
    arg3: NNode,
    _arg4: NNode,
  ) => {
    const key = <MetadataKeysType> arg0
      .sourceString;
    const val = arg3.sourceString;

    if (key == "key") {
      this.#s[key] = KeyFromString(val);
    } else {
      this.#s[key] = val;
    }
  };
}

export function ParseChord(rawChord: string): Result<Chord> {
  const matchResult = grammar.Chord.match(rawChord, "chord");
  if (matchResult.failed()) return Err(matchResult.message!);
  const semantics = grammar.Chord.createSemantics();
  semantics.addOperation<void>("eval", new ChordActions());
  const chord: Chord = semantics(matchResult).eval();
  return Ok(chord);
}

export function ParseSong(rawSong: string): Result<Song> {
  const matchResult = grammar.Song.match(rawSong, "Song");
  if (matchResult.failed()) return Err(matchResult.message!);
  const semantics = grammar.Song.createSemantics();
  semantics.addOperation<void>("eval", new SongActions(new Song()));
  const song: Song = semantics(matchResult).eval();
  song.key ||= song.guessKey();
  return Ok(song);
}

const isRepeat = (s: string) => {
  return AllRepeatedChordSymbols.includes(s);
};

const isImplicitMajor = (quality: INode, extent: INode, alterations: INode) => (
  !quality.sourceString &&
  (extent.sourceString.trim() === "" || extent.sourceString.startsWith("6")) &&
  !alterations.sourceString.includes("alt")
);

const isImplicitDominant = (
  quality: INode,
  extent: INode,
  alterations: INode,
) => (
  !quality.sourceString &&
  (
    ["7", "9", "11", "13"].some((s) => extent.sourceString.startsWith(s)) ||
    alterations.sourceString.includes("alt")
  )
);

const isImplicitPower = (quality: INode, extent: INode) => (
  !quality.sourceString && extent.sourceString.startsWith("5")
);

function normalizeLetter(str: string): string {
  return str.toUpperCase();
}

function normalizeAccidentals(str: string): string {
  return str.replace("♯", "#").replace("♭", "b");
}
