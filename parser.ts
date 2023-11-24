// @deno-types="./grammar.ohm-bundle.d.ts"
import grammar from "./grammar.ohm-bundle";
import type { IterationNode, NonterminalNode, TerminalNode } from "ohm-js";
import type { SongActionDict } from "./grammar.ohm-bundle.d.ts";
import {
  AllRepeatedChordSymbols,
  Bar,
  BarType,
  Chord,
  Err,
  guessKey,
  Letter,
  Ok,
  QualityAugmented,
  QualityDiminished,
  QualityDominant,
  QualityMajor,
  QualityMinor,
  QualityMinorMajor,
  QualityPower,
  QualitySuspended,
  Result,
  Song,
} from "./types.ts";

function isImplicitMajor(
  quality: IterationNode,
  extent: IterationNode,
  _alterations: IterationNode,
): boolean {
  return (
    quality.sourceString.trim() === "" && extent.sourceString.startsWith("6")
  );
}

function isImplicitDominant(
  quality: IterationNode,
  extent: IterationNode,
  _alterations: IterationNode,
): boolean {
  return (
    quality.sourceString.trim() === "" &&
    ["7", "9", "11", "13", "alt"].some((s) => extent.sourceString.startsWith(s))
  );
}

function isImplicitPower(
  quality: IterationNode,
  extent: IterationNode,
  _alterations: IterationNode,
): boolean {
  return (
    quality.sourceString.trim() === "" && extent.sourceString.startsWith("5")
  );
}

function ChordActions(c: Chord): SongActionDict<Chord> {
  const _Actions: SongActionDict<Chord> = {
    ChordExp(root, flavor) {
      root.eval();

      if (flavor.sourceString === "") {
        c.qualityClass = QualityMajor;
      } else {
        flavor.eval();
      }

      return c;
    },
    root(
      _arg0: NonterminalNode,
      _arg1: IterationNode,
    ) {
      c.tonic = <Letter> this.sourceString;
      return c;
    },
    flavor(
      quality: IterationNode,
      extent: IterationNode,
      alterations: IterationNode,
    ) {
      if (isImplicitPower(quality, extent, alterations)) {
        c.qualityClass = QualityPower;
      } else if (isImplicitMajor(quality, extent, alterations)) {
        c.qualityClass = QualityMajor;
      } else if (isImplicitDominant(quality, extent, alterations)) {
        c.qualityClass = QualityDominant;
      } else if (quality.sourceString !== "") {
        if (quality.numChildren > 1) {
          throw new Error(
            `expected Node to only have 0 or 1 children, but it has ${quality.numChildren}`,
          );
        }
        quality.children[0]?.eval();
      }

      if (extent.sourceString !== "") {
        if (extent.numChildren > 1) {
          throw new Error(
            `expected Node to only have 0 or 1 children, but it has ${extent.numChildren}`,
          );
        }
        extent.children[0]?.eval();
      }

      c.alterations = alterations.children.map((alterationNode) =>
        alterationNode.sourceString
      );

      return c;
    },
    // noteLetter(
    //   _arg0: NonterminalNode | TerminalNode,
    // ) {
    //   return c;
    // },
    // accidental(_arg0: TerminalNode) {
    //   return c;
    // },
    // alteration_symbol(
    //   _arg0: NonterminalNode | TerminalNode,
    // ) {
    //   return c;
    // },
    extent(arg0: NonterminalNode) {
      c.extent = arg0.sourceString;
      return c;
    },
    quality(arg0: NonterminalNode) {
      arg0.eval();
      return c;
    },
    sus(_arg0: NonterminalNode) {
      c.qualityClass = QualitySuspended;
      return c;
    },
    minor_major(
      _arg0: NonterminalNode | TerminalNode,
    ) {
      c.qualityClass = QualityMinorMajor;
      return c;
    },
    minor_major_with_parens(
      _arg0: NonterminalNode,
      _arg1: TerminalNode,
      _arg2: NonterminalNode,
      _arg3: NonterminalNode,
      _arg4: TerminalNode,
    ) {
      c.qualityClass = QualityMinorMajor;
      return c;
    },
    augmented(
      _arg0: NonterminalNode | TerminalNode,
    ) {
      c.qualityClass = QualityAugmented;
      return c;
    },
    diminished(
      _arg0: NonterminalNode | TerminalNode,
    ) {
      c.qualityClass = QualityDiminished;
      return c;
    },
    dominant(_arg0: NonterminalNode) {
      c.qualityClass = QualityDominant;
      return c;
    },
    half_diminished(_arg0: NonterminalNode) {
      c.qualityClass = QualityDiminished;
      return c;
    },
    major(_arg0: NonterminalNode | TerminalNode) {
      c.qualityClass = QualityMajor;
      return c;
    },
    minor(_arg0: NonterminalNode | TerminalNode) {
      c.qualityClass = QualityMinor;
      return c;
    },
    // alteration(_arg0: NonterminalNode) {
    //   return c;
    // },
    // alteration_no_parens(
    //   _arg0: Node,
    //   _arg1: IterationNode | NonterminalNode,
    // ) {
    //   return c;
    // },
    // alteration_in_parens(
    //   _arg0: TerminalNode,
    //   _arg1: IterationNode,
    //   _arg2: NonterminalNode,
    //   _arg3: IterationNode,
    //   _arg4: TerminalNode,
    // ) {
    //   return c;
    // },
    // alteration_add_no_omit(
    //   _arg0: IterationNode,
    //   _arg1: NonterminalNode,
    //   _arg2: IterationNode,
    // ) {
    //   return c;
    // },
  };

  return _Actions;
}

export function ParseChord(rawChord: string): Result<Chord> {
  const matchResult = grammar.match(rawChord, "ChordExp");

  if (matchResult.failed()) {
    return Err(matchResult.message || "failed to parse chord: empty error");
  }

  const chord = {
    _raw: rawChord,
    tonic: <Letter> "C",
    flavor: undefined,
    quality: undefined,
    qualityClass: undefined,
    extent: undefined,
    alterations: [],
  };

  const semantics = grammar.createSemantics();

  semantics.addOperation("eval", ChordActions(chord));
  semantics(matchResult).eval();

  return Ok(chord);
}

export function ParseSong(rawSong: string): Result<Song> {
  const matchResult = grammar.match(rawSong);

  if (matchResult.failed()) {
    return Err(matchResult.message || "failed to parse song: empty error");
  }

  const song: Song = {
    bars: [],
  };

  const semantics = grammar.createSemantics();

  semantics.addOperation("eval", Actions(song));
  semantics(matchResult).eval();

  song.key ||= guessKey(song);

  return Ok(song);
}

function Actions(s: Song): SongActionDict<Song> {
  function defaultMetaFunc(
    _1: NonterminalNode,
    _2: NonterminalNode,
    value: IterationNode,
    _3: NonterminalNode,
  ) {
    return value.eval();
  }

  const _Actions: SongActionDict<Song> = {
    Song(metadata, bars) {
      metadata.children.map((e) => e.eval());
      bars.eval();
      return s;
    },
    Bars(barline, bars, _2) {
      let previousChord: Chord | undefined = undefined;

      bars.children.forEach((barNode) => {
        const chords = barNode.children.map(
          (chordNode) => {
            if (
              !previousChord ||
              !AllRepeatedChordSymbols.includes(chordNode.sourceString.trim())
            ) {
              // i.e. not a repetition
              previousChord = (ParseChord(chordNode.sourceString).value)!;
            }

            return ({ ...previousChord });
          },
        );

        const bar: Bar = {
          openBar: barline.sourceString as BarType,
          closeBar: barline.sourceString as BarType,
          chords,
        };
        s.bars.push(bar);
      });

      return s;
    },
    Chord(_chordExpOrRepeat) {
      return s;
    },
    ChordExp(_root, _flavor) {
      return s;
    },
    metaTitle: defaultMetaFunc,
    metaArtist: defaultMetaFunc,
    metaYear: defaultMetaFunc,
    metaSig: defaultMetaFunc,
    metaKey: defaultMetaFunc,
    metaTitleValue(_) {
      s.title = this.sourceString;
      return s;
    },
    metaArtistValue(_) {
      s.artist = this.sourceString;
      return s;
    },
    metaYearValue(_) {
      s.year = this.sourceString;
      return s;
    },
    metaSigValue(_) {
      s.sig = this.sourceString;
      return s;
    },
    metaKeyValue(_) {
      s.key = this.sourceString;
      return s;
    },
  };

  return _Actions;
}
