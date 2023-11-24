// AUTOGENERATED FILE
// This file was generated from grammar.ohm by `ohm generateBundles`.

import {
  BaseActionDict,
  Grammar,
  IterationNode,
  Namespace,
  Node,
  NonterminalNode,
  Semantics,
  TerminalNode,
} from "ohm-js";

export interface ChordActionDict<T> extends BaseActionDict<T> {
  ChordExp?: (
    this: NonterminalNode,
    arg0: NonterminalNode,
    arg1: NonterminalNode,
  ) => T;
  root?: (
    this: NonterminalNode,
    arg0: NonterminalNode,
    arg1: IterationNode,
  ) => T;
  flavor?: (
    this: NonterminalNode,
    arg0: IterationNode,
    arg1: IterationNode,
    arg2: IterationNode,
  ) => T;
  noteLetter?: (
    this: NonterminalNode,
    arg0: NonterminalNode | TerminalNode,
  ) => T;
  accidental?: (this: NonterminalNode, arg0: TerminalNode) => T;
  alteration_symbol?: (
    this: NonterminalNode,
    arg0: NonterminalNode | TerminalNode,
  ) => T;
  extent?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  thirteen?: (this: NonterminalNode, arg0: TerminalNode) => T;
  eleven?: (this: NonterminalNode, arg0: TerminalNode) => T;
  nine?: (this: NonterminalNode, arg0: TerminalNode) => T;
  seven?: (this: NonterminalNode, arg0: TerminalNode) => T;
  six_and_nine?: (
    this: NonterminalNode,
    arg0: NonterminalNode,
    arg1: IterationNode,
    arg2: NonterminalNode,
  ) => T;
  six?: (this: NonterminalNode, arg0: TerminalNode) => T;
  five?: (this: NonterminalNode, arg0: TerminalNode) => T;
  four?: (this: NonterminalNode, arg0: TerminalNode) => T;
  two?: (this: NonterminalNode, arg0: TerminalNode) => T;
  quality?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  sus?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  minor_major?: (
    this: NonterminalNode,
    arg0: NonterminalNode | TerminalNode,
  ) => T;
  minor_major_with_parens?: (
    this: NonterminalNode,
    arg0: NonterminalNode,
    arg1: TerminalNode,
    arg2: NonterminalNode,
    arg3: NonterminalNode,
    arg4: TerminalNode,
  ) => T;
  augmented?: (
    this: NonterminalNode,
    arg0: NonterminalNode | TerminalNode,
  ) => T;
  diminished?: (
    this: NonterminalNode,
    arg0: NonterminalNode | TerminalNode,
  ) => T;
  dominant?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  half_diminished?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  major?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode) => T;
  minor?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode) => T;
  alteration?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  alteration_no_parens?: (
    this: NonterminalNode,
    arg0: Node,
    arg1: IterationNode | NonterminalNode,
  ) => T;
  alteration_in_parens?: (
    this: NonterminalNode,
    arg0: TerminalNode,
    arg1: IterationNode,
    arg2: NonterminalNode,
    arg3: IterationNode,
    arg4: TerminalNode,
  ) => T;
  alteration_add_no_omit?: (
    this: NonterminalNode,
    arg0: IterationNode,
    arg1: NonterminalNode,
    arg2: IterationNode,
  ) => T;
  newline?: (
    this: NonterminalNode,
    arg0: IterationNode,
    arg1: TerminalNode,
  ) => T;
  spaceNoNL?: (this: NonterminalNode, arg0: TerminalNode) => T;
}

export interface ChordSemantics extends Semantics {
  addOperation<T>(name: string, actionDict: ChordActionDict<T>): this;
  extendOperation<T>(name: string, actionDict: ChordActionDict<T>): this;
  addAttribute<T>(name: string, actionDict: ChordActionDict<T>): this;
  extendAttribute<T>(name: string, actionDict: ChordActionDict<T>): this;
}

export interface ChordGrammar extends Grammar {
  createSemantics(): ChordSemantics;
  extendSemantics(superSemantics: ChordSemantics): ChordSemantics;
}

export interface SongActionDict<T> extends ChordActionDict<T> {
  Song?: (
    this: NonterminalNode,
    arg0: IterationNode,
    arg1: NonterminalNode,
  ) => T;
  Bars?: (
    this: NonterminalNode,
    arg0: NonterminalNode,
    arg1: IterationNode,
    arg2: IterationNode,
  ) => T;
  lineComment?: (
    this: NonterminalNode,
    arg0: TerminalNode,
    arg1: IterationNode,
    arg2: NonterminalNode,
  ) => T;
  space?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode) => T;
  metadata?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  metaTitle?: (
    this: NonterminalNode,
    arg0: NonterminalNode,
    arg1: IterationNode,
    arg2: NonterminalNode,
    arg3: NonterminalNode,
  ) => T;
  metaArtist?: (
    this: NonterminalNode,
    arg0: NonterminalNode,
    arg1: IterationNode,
    arg2: NonterminalNode,
    arg3: NonterminalNode,
  ) => T;
  metaYear?: (
    this: NonterminalNode,
    arg0: NonterminalNode,
    arg1: IterationNode,
    arg2: NonterminalNode,
    arg3: NonterminalNode,
  ) => T;
  metaSig?: (
    this: NonterminalNode,
    arg0: NonterminalNode,
    arg1: IterationNode,
    arg2: NonterminalNode,
    arg3: NonterminalNode,
  ) => T;
  metaKey?: (
    this: NonterminalNode,
    arg0: NonterminalNode,
    arg1: IterationNode,
    arg2: NonterminalNode,
    arg3: NonterminalNode,
  ) => T;
  metaTitleValue?: (this: NonterminalNode, arg0: IterationNode) => T;
  metaArtistValue?: (this: NonterminalNode, arg0: IterationNode) => T;
  metaYearValue?: (this: NonterminalNode, arg0: IterationNode) => T;
  metaSigValue?: (this: NonterminalNode, arg0: IterationNode) => T;
  metaKeyValue?: (this: NonterminalNode, arg0: IterationNode) => T;
  Barline?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  BarlineWithRepeats?: (
    this: NonterminalNode,
    arg0: NonterminalNode,
    arg1: NonterminalNode,
  ) => T;
  BarRepeatSignifierOpen?: (
    this: NonterminalNode,
    arg0: IterationNode,
    arg1: IterationNode,
    arg2: TerminalNode,
  ) => T;
  BarRepeatSignifierClose?: (
    this: NonterminalNode,
    arg0: TerminalNode,
    arg1: IterationNode,
    arg2: IterationNode,
  ) => T;
  DoubleBarline?: (this: NonterminalNode, arg0: TerminalNode) => T;
  SingleBarline?: (this: NonterminalNode, arg0: TerminalNode) => T;
  RepeatPreviousChord?: (this: NonterminalNode, arg0: TerminalNode) => T;
  Chord?: (this: NonterminalNode, arg0: NonterminalNode) => T;
}

export interface SongSemantics extends Semantics {
  addOperation<T>(name: string, actionDict: SongActionDict<T>): this;
  extendOperation<T>(name: string, actionDict: SongActionDict<T>): this;
  addAttribute<T>(name: string, actionDict: SongActionDict<T>): this;
  extendAttribute<T>(name: string, actionDict: SongActionDict<T>): this;
}

export interface SongGrammar extends Grammar {
  createSemantics(): SongSemantics;
  extendSemantics(superSemantics: SongSemantics): SongSemantics;
}

declare const ns: {
  Chord: ChordGrammar;
  Song: SongGrammar;
};
export default ns;
