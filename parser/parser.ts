// @deno-types="./grammar.ohm-bundle.d.ts"
import grammar from "./grammar.ohm-bundle.js";
import type { IterationNode, NonterminalNode, TerminalNode } from "ohm-js";
import type { SongActionDict } from "./grammar.ohm-bundle.js";
import {
  Bar,
  Barline,
  Chord,
  Chordish,
  Letter,
  NoChord,
  QualityAugmented,
  QualityDiminished,
  QualityDominant,
  QualityMajor,
  QualityMinor,
  QualityMinorMajor,
  QualityPower,
  QualitySuspended,
  Song,
} from "../types.ts";
import { AllRepeatedChordSymbols, Err, Ok, Result } from "../types.ts";

function isImplicitMajor(
  quality: IterationNode,
  extent: IterationNode,
  _alterations: IterationNode,
): boolean {
  return (
    quality.sourceString.trim() === "" &&
    (extent.sourceString.trim() === "" || extent.sourceString.startsWith("6"))
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
    Chord(root, flavor) {
      root.eval();

      if (flavor.sourceString === "") {
        c.quality = QualityMajor;
        // c.flavor = QualityMajor;
      } else {
        flavor.eval();
      }

      return c;
    },
    root(
      _arg0: NonterminalNode,
      _arg1: IterationNode,
    ) {
      c.tonic = <Letter> this.sourceString.replace(
        /(^[A-Ga-g])/g,
        function (t) {
          return t.toUpperCase();
        },
      );

      return c;
    },
    flavor(
      quality: IterationNode,
      extent: IterationNode,
      alterations: IterationNode,
    ) {
      // c.flavor = this.sourceString;

      if (isImplicitPower(quality, extent, alterations)) {
        c.quality = QualityPower;
      } else if (isImplicitMajor(quality, extent, alterations)) {
        c.quality = QualityMajor;
      } else if (isImplicitDominant(quality, extent, alterations)) {
        c.quality = QualityDominant;
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

      if (!c.alterations || c.alterations.length === 0) {
        c.alterations = [];
      }

      c.alterations.push(
        ...alterations.children.map((alterationNode) =>
          alterationNode.sourceString
        ),
      );

      return c;
    },
    extent(arg0: NonterminalNode) {
      arg0.eval();
      return c;
    },
    thirteen(_arg0: NonterminalNode) {
      c.extent = 13;
      return c;
    },
    eleven(_arg0: NonterminalNode) {
      c.extent = 11;
      return c;
    },
    nine(_arg0: NonterminalNode) {
      c.extent = 9;
      return c;
    },
    seven(_arg0: NonterminalNode) {
      c.extent = 7;
      return c;
    },
    six_and_nine(
      _arg0: NonterminalNode,
      _arg1: IterationNode,
      _arg2: NonterminalNode,
    ) {
      c.extent = 6;
      if (!c.alterations || c.alterations.length === 0) {
        c.alterations = [];
      }
      c.alterations.push("(add 9)");
      return c;
    },
    six(_arg0: NonterminalNode) {
      c.extent = 6;
      return c;
    },
    five(_arg0: NonterminalNode) {
      c.extent = 5;
      return c;
    },
    four(_arg0: NonterminalNode) {
      c.extent = 4;
      return c;
    },
    two(_arg0: NonterminalNode) {
      c.extent = 2;
      return c;
    },
    quality(arg0: NonterminalNode) {
      arg0.eval();
      return c;
    },
    sus(_arg0: NonterminalNode) {
      c.quality = QualitySuspended;
      return c;
    },
    minor_major(
      _arg0: NonterminalNode | TerminalNode,
    ) {
      c.quality = QualityMinorMajor;
      return c;
    },
    minor_major_with_parens(
      _arg0: NonterminalNode,
      _arg1: TerminalNode,
      _arg2: NonterminalNode,
      _arg3: NonterminalNode,
      _arg4: TerminalNode,
    ) {
      c.quality = QualityMinorMajor;
      return c;
    },
    augmented(
      _arg0: NonterminalNode | TerminalNode,
    ) {
      c.quality = QualityAugmented;
      return c;
    },
    diminished(
      _arg0: NonterminalNode | TerminalNode,
    ) {
      c.quality = QualityDiminished;
      return c;
    },
    dominant(_arg0: NonterminalNode) {
      c.quality = QualityDominant;
      return c;
    },
    half_diminished(_arg0: NonterminalNode) {
      c.quality = QualityMinor;
      if (!c.alterations || c.alterations.length === 0) {
        c.alterations = [];
      }
      c.alterations.push("b5");
      c.extent ||= 7;
      return c;
    },
    major(_arg0: NonterminalNode | TerminalNode) {
      c.quality = QualityMajor;
      return c;
    },
    minor(_arg0: NonterminalNode | TerminalNode) {
      c.quality = QualityMinor;
      return c;
    },
  };

  return _Actions;
}

export function ParseChord(rawChord: string): Result<Chord> {
  const matchResult = grammar.Chord.match(rawChord, "Chord");

  if (matchResult.failed()) {
    return Err(matchResult.message || "failed to parse chord: empty error");
  }

  const chord = new Chord(
    <Letter> "C",
    QualityMajor,
  );

  const semantics = grammar.Chord.createSemantics();

  semantics.addOperation("eval", ChordActions(chord));
  semantics(matchResult).eval();

  return Ok(chord);
}

export function ParseSong(rawSong: string): Result<Song> {
  const matchResult = grammar.Song.match(rawSong, "Song");

  if (matchResult.failed()) {
    return Err(matchResult.message || "failed to parse song: empty error");
  }

  const song = new Song();

  const semantics = grammar.Song.createSemantics();

  semantics.addOperation("eval", Actions(song));
  semantics(matchResult).eval();

  song.key ||= song.guessKey();

  return Ok(song);
}

function isRepeat(s: string): boolean {
  return AllRepeatedChordSymbols.includes(s);
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
    Bars(barline, barChords, closingBarlines) {
      let previousChord: Chordish | undefined = undefined;
      let previousBarline = barline.sourceString;

      barChords.children.forEach((barNode, i) => {
        const chords = barNode.children.map(
          (chordishNode) => {
            const chordString = chordishNode.sourceString.trim();

            if (
              chordString === NoChord ||
              (previousChord === NoChord && isRepeat(chordString))
            ) {
              previousChord = NoChord;
              return NoChord;
            } else {
              previousChord = <Chord | undefined> previousChord;

              if (!previousChord) {
                // first chord in song
                previousChord = (ParseChord(chordString).value)!;
              } else if (!isRepeat(chordString)) {
                // i.e. not a repetition
                previousChord = (ParseChord(chordString).value)!;
              }

              return previousChord.dup();
            }
          },
        );
        const thisBarline = closingBarlines.children[i]?.sourceString?.split(
          /\s/,
        )[0];
        const bar: Bar = {
          openBarline: <Barline> previousBarline,
          closeBarline: <Barline> thisBarline,
          chords,
        };
        previousBarline = thisBarline;
        s.bars.push(bar);
      });

      return s;
    },
    Chordish(_) {
      return s;
    },
    Chord(_root, _flavor) {
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
