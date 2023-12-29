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
import { Add6, Chord, Extent, type Quality, Triad } from "../theory/chord.ts";
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
import {
  Add,
  Add9,
  type Alteration,
  Everything,
  Lower,
  No,
  Over,
  Raise,
  Sus,
  Sus4,
} from "../theory/chord/alteration.ts";
import { Power } from "../theory/chord/quality/dyad.ts";
import { Aug, Dim, Maj, Min } from "../theory/chord/quality/triad.ts";
import {
  Dim7,
  Dom7,
  Maj7,
  Min7,
  Min7Fl5,
  type type as TetradType,
} from "../theory/chord/quality/tetrad.ts";
import { type Diminished, type Major, type Minor } from "../theory/interval.ts";
import { pick } from "../lib/object.ts";
import { normalizeAccidentals } from "../lib/string.ts";

interface SeventhPlusQuality {
  seventh: typeof Major | typeof Minor | typeof Diminished;
  type: typeof TetradType;
  extent: Extent;
}

interface FlavorNode extends NNode {
  eval?(): [Quality, Array<Alteration>]; // has to be optional because of Typescript interface limitations
}

interface QualityNode extends NNode {
  eval?(): [Quality, Array<Alteration>]; // has to be optional because of Typescript interface limitations
}

interface TriadQualityNode extends NNode {
  eval?(): [Triad, Array<Alteration>]; // has to be optional because of Typescript interface limitations
}

interface ExtendedQualityNode extends NNode {
  eval?(): SeventhPlusQuality; // has to be optional because of Typescript interface limitations
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
  chord = (rootN: NNode, flavorNode: FlavorNode) => {
    const root = rootN.eval();
    const [quality, alterations] = flavorNode.eval!();
    const c = new Chord(root, quality, ...alterations);
    return c;
  };

  root = (root: NNode, accidentals: INode) =>
    [
      normalizeLetter(root.sourceString),
      normalizeAccidentals(accidentals.sourceString),
    ].join("");

  flavor = (
    qualityNode: QualityNode,
    alterationsNodes: AlterationsNode,
  ): [Quality, Array<Alteration>] => {
    const [q, as] = qualityNode.eval!();
    const alterations = alterationsNodes.children.map((a) => a.eval!());
    return [q, [...as, ...alterations]];
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

  #qualityPassthrough = (q: Quality) => (_: NNode) => [q, []];
  quality = (
    triadQN: TriadQualityNode,
    maybeExtendedQN: INode,
  ): [Quality, Alteration[]] => {
    const [triad, as]: [Triad, Array<Alteration>] = triadQN.eval!();
    const eqn: ExtendedQualityNode | undefined = maybeExtendedQN.child(0);
    const extendedQ: SeventhPlusQuality | undefined = eqn?.eval!();
    const result = extendedQ
      ? {
        ...triad,
        ...extendedQ,
      }
      : { ...triad };
    return [<Quality> result, [...as]];
  };
  augTriad = this.#qualityPassthrough(Aug);
  dimTriad = this.#qualityPassthrough(Dim);
  majTriad = this.#qualityPassthrough(Maj);
  minTriad = this.#qualityPassthrough(Min);
  power = this.#qualityPassthrough(Power);
  majX = (_0: NNode, extentNode: ExtentNode): SeventhPlusQuality => {
    const extent = extentNode.eval!();
    return { ...pick(Maj7, "seventh", "type"), extent };
  };
  minX = (_0: NNode, extentNode: ExtentNode): SeventhPlusQuality => {
    const extent = extentNode.eval!();
    return { ...pick(Min7, "seventh", "type"), extent };
  };
  domX = (extentNode: ExtentNode): SeventhPlusQuality => {
    const extent = extentNode.eval!();
    return { ...pick(Dom7, "seventh", "type"), extent };
  };
  explicitDomX = (_0: NNode, maybeExtentNode: INode): SeventhPlusQuality => {
    const extentNode = <ExtentNode | undefined> maybeExtentNode.child(0);
    const extent = extentNode?.eval!();
    return { ...pick(Dom7, "seventh", "type"), extent: extent || 7 };
  };
  dimX = (_0: NNode, extentNode: ExtentNode) => {
    const extent = extentNode.eval!();
    return { ...pick(Dim7, "third", "fifth", "seventh", "type"), extent };
  };
  hdimX = (_0: TNode, maybeExtentNode: INode) => {
    const extentNode = <ExtentNode | undefined> maybeExtentNode.child(0);
    const extent = extentNode?.eval!();
    return extent ? { ...Min7Fl5, extent } : Min7Fl5;
  };

  alteration = (arg0: NNode) => arg0.eval();
  alter = (arg0: AlterNode) => arg0.eval!();
  alter_raise = (_0: NNode, arg1: Node) => Raise(arg1.eval());
  alter_lower = (_0: NNode, arg1: Node) => Lower(arg1.eval());
  alter_add = (_0: NNode, _1: INode, arg2: Node) => Add(arg2.eval());
  alter_omit = (_0: NNode, _a: INode, arg2: Node) => No(arg2.eval());
  alter_compound = (_0: TNode, arg1: Node) => Over(arg1.eval());
  alter_suspend = (_0: NNode, arg1: INode) => Sus(arg1.eval());
  alter_suspend_implicit_4 = (_0: NNode) => Sus4;
  alter_everything_implicit_7 = (_0: NNode) => Everything(7);
  alter_add_6 = (_0: NNode) => Add6;
  alter_add_6_add_9 = (_0: TNode, _1: NNode) => Add9;
  alter_everything = (_0: TNode, arg1: INode) => Everything(arg1.eval());
  alteration_in_parens = (
    _0: TNode,
    _1: INode,
    arg2: AlterNode,
    _3: INode,
    _4: TNode,
  ) => arg2.eval!();
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
