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
  type Bar,
  type Barline,
  type Chordish,
  type Metadata,
  type MetadataKeysType,
  NoChord,
  OptionalChord,
  RepeatPreviousChord,
  Song,
} from "./song.ts";
import { Err, Ok, type Result } from "../lib/result.ts";
import { Key } from "../theory/key.ts";
import { type Letter } from "../theory/letter.ts";
import { Alteration } from "../theory/chord/alteration.ts";

interface FlavorNode extends NNode {
  eval?(): [Quality, Extent, ...Array<Alteration>]; // has to be optional because of Typescript interface limitations
}

interface QualityNode extends NNode {
  eval?(): [Quality, Extent, Array<Alteration>]; // has to be optional because of Typescript interface limitations
}

interface AlterationsNode extends INode {
  eval?(): Array<Alteration>; // has to be optional because of Typescript interface limitations
  children: Array<AlterNode>;
  isIteration(): boolean;
}

interface AlterNode extends NNode {
  eval?(): Alteration; // has to be optional because of Typescript interface limitations
}

interface ExtentNode extends Node {
  eval?(): Extent;
}

class ChordActions implements ChordActionDict<void> {
  chord = (root: NNode, flavor: FlavorNode) =>
    new Chord(root.eval(), ...(flavor.eval!()));

  root = (root: NNode, accidentals: INode) =>
    [
      normalizeLetter(root.sourceString),
      normalizeAccidentals(accidentals.sourceString),
    ].join("");

  flavor = (
    qualityNode: QualityNode,
    extentNode: ExtentNode,
    alterationsNode: AlterationsNode,
  ) => {
    const [q, e, a]: [
      Quality | undefined,
      Extent | undefined,
      Alteration[],
    ] = qualityNode.eval!();

    const e2: [Extent | undefined] = extentNode.child(0)?.eval();

    const alterations: Alteration[] = alterationsNode.children.flatMap((a) =>
      a.isIteration()
        ? a.children.flatMap((a2: AlterNode) => a2.eval!())
        : a.eval!()
    );

    return [q, e2 || e, ...(a || []), ...alterations];
  };

  #evalPassthrough = (n: NNode) => n.eval();

  extent = this.#evalPassthrough;
  thirteen = (_: NNode) => 13;
  eleven = (_: NNode) => 11;
  nine = (_: NNode) => 9;
  seven = (_: NNode) => 7;
  six = (_: NNode) => 6;
  five = (_: NNode) => 5;
  four = (_: NNode) => 4;
  three = (_: NNode) => 3;
  two = (_: NNode) => 2;

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
  half_diminished = (_0: NNode) => [Minor, 7, [new Alteration("lower", 5)]];
  minor_major = this.#qualityPassthrough(MinorMajor);

  alteration = (arg0: NNode) => arg0.eval();
  alteration_no_parens = (arg0: NNode) => arg0.eval();

  alter_raise = (_0: NNode, arg1: Node) => new Alteration("raise", arg1.eval());
  alter_lower = (_0: NNode, arg1: Node) => new Alteration("lower", arg1.eval());
  alter_major = (_0: NNode, arg1: Node) => new Alteration("major", arg1.eval());
  alter_minor = (_0: NNode, arg1: Node) => new Alteration("minor", arg1.eval());
  alter_add = (_0: NNode, _1: INode, arg2: Node) =>
    new Alteration("add", arg2.eval());
  alter_omit = (_0: NNode, _a: INode, arg2: Node) =>
    new Alteration("omit", arg2.eval());
  alter_compound = (_0: TNode, arg1: Node) =>
    new Alteration("compound", arg1.eval());
  alter_suspend = (_0: NNode, arg1: INode) =>
    new Alteration("suspend", arg1.eval());
  alter_suspend_implicit_4 = (_0: NNode) => new Alteration("suspend", 4);
  alter_everything_implicit_7 = (_0: NNode) => new Alteration("everything", 7);
  alter_implicit_add_9 = (_0: TNode, _1: TNode) => new Alteration("add", 9);
  alter_everything = (_0: TNode, arg1: INode) =>
    new Alteration("everything", arg1.eval());
  alteration_in_parens = (
    _0: TNode,
    _1: INode,
    arg2: NNode,
    _3: INode,
    _4: TNode,
  ) => arg2.eval();
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
    let previousBarline = barline.sourceString;

    zip(barChords.children, closingBarlines.children).forEach(
      ([barNode, closingBarlineNode]) => {
        const chords = barNode.children.map((chordishNode) =>
          <Chordish> chordishNode.eval()
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
