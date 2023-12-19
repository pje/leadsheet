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
  ChordTypeName,
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
  type Bar,
  type Barline,
  type Chordish,
  type Metadata,
  type MetadataKeysType,
  NoChord,
  NoChordTypeName,
  OptionalChord,
  OptionalChordTypeName,
  RepeatPreviousChord,
  RepeatPreviousChordTypeName,
  Song,
} from "./song.ts";
import { Err, Ok, type Result } from "../lib/result.ts";
import { Key } from "../theory/key.ts";
import { type Letter } from "../theory/letter.ts";
import { nonexhaustiveSwitchGuard } from "../lib/switch.ts";

class ChordActions implements ChordActionDict<void> {
  chord = (root: NNode, flavor: NNode) =>
    new Chord(root.eval(), ...(flavor.eval()));

  root = (root: NNode, accidentals: INode) =>
    [
      normalizeLetter(root.sourceString),
      normalizeAccidentals(accidentals.sourceString),
    ].join("");

  flavor = (qualityNode: NNode, extentNode: INode, alterationsNodes: INode) => {
    const [q, e, a]: [
      Quality | undefined,
      Extent | undefined,
      string[],
    ] = qualityNode.eval();

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
  power = this.#qualityPassthrough(Power);
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
  #currentSection: string | undefined;

  constructor() {
    super();
    this.#currentSection = undefined;
  }

  Song = (metadataNodes: INode, sectionsNode: NNode) => {
    const bars: Bar[] = sectionsNode.eval();
    const metadata: Metadata = Object.fromEntries(
      metadataNodes.children.map((e) => e.eval()),
    );
    const song = new Song(bars, metadata);
    return song;
  };

  Sections = (maybeSection: INode, bars: INode) => {
    return zip(maybeSection.children, bars.children).flatMap(
      ([section, bars2]) => {
        section.children.forEach((c2) => c2.eval());
        return bars2.eval();
      },
    );
  };

  Section = (sectionName: INode, _1: TNode) => {
    // TODO: get rid of the statefulness here
    this.#currentSection = sectionName.sourceString;
  };

  Bars = (barline: NNode, barChords: INode, closingBarlines: INode) => {
    const bars: Bar[] = [];
    let previousChord: Chord | OptionalChord | NoChord | undefined = undefined;
    let previousBarline = barline.sourceString;

    zip(barChords.children, closingBarlines.children).forEach(
      ([barNode, closingBarlineNode]) => {
        const chords = barNode.children.map(
          (chordishNode) => {
            const chordish = <Chordish> chordishNode.eval();
            const { type } = chordish;

            switch (type) {
              case RepeatPreviousChordTypeName:
                return previousChord?.dup() || chordish;
              case ChordTypeName:
              case OptionalChordTypeName:
              case NoChordTypeName:
                previousChord = chordish.dup();
                return chordish.dup();
              default:
                nonexhaustiveSwitchGuard(type);
            }
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
        bars.push(bar);
      },
    );

    return bars;
  };

  NoChord = (_0: TNode) => new NoChord();
  RepeatPreviousChord = (_0: TNode) => new RepeatPreviousChord();

  OptionalChord = (
    _0: TNode,
    _1: INode,
    chordNode: NNode,
    _3: INode,
    _4: TNode,
  ): OptionalChord => new OptionalChord(chordNode.eval());

  metaString = (
    arg0: Node,
    _arg1: TNode,
    _arg2: INode,
    arg3: NNode,
    _arg4: NNode,
  ): [Exclude<MetadataKeysType, "key">, string] => {
    const key = <Exclude<MetadataKeysType, "key">> arg0.sourceString;
    const val = arg3.sourceString;
    return [key, val];
  };

  metaKey = (
    _arg0: TNode,
    _arg1: TNode,
    _arg2: INode,
    arg3: NNode,
    _arg4: NNode,
  ): ["key", Key | undefined] => {
    const { tonic, flavor } = arg3.eval();
    return ["key", tonic ? new Key(tonic, flavor) : undefined];
  };

  scale = (arg0: NNode, arg1: INode): Key => {
    const tonic: Letter = arg0.eval();
    const flavor: string | undefined = arg1.child(0)?.sourceString;

    return new Key(tonic, flavor);
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
  semantics.addOperation<void>("eval", new SongActions());
  const song: Song = semantics(matchResult).eval();
  return Ok(song);
}

function normalizeLetter(str: string): string {
  return str.toUpperCase();
}

function normalizeAccidentals(str: string): string {
  return str.replace("♯", "#").replace("♭", "b");
}
