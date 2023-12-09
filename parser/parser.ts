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
import { zip } from "../utils.ts";

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

class ChordActions implements SongActionDict<Chord> {
  #c: Chord;

  constructor(c: Chord) {
    this.#c = c;
  }

  Chord = (root: NonterminalNode, flavor: NonterminalNode) => {
    root.eval();

    if (flavor.sourceString === "") {
      this.#c.quality = QualityMajor;
      // this.#c.flavor = QualityMajor;
    } else {
      flavor.eval();
    }

    return this.#c;
  };

  root = (root: NonterminalNode, accidentals: IterationNode) => {
    this.#c.tonic = <Letter> `${root.sourceString}${accidentals.sourceString}`
      .replace(
        /(^[A-Ga-g])/g,
        function (t) {
          return t.toUpperCase();
        },
      );

    return this.#c;
  };

  flavor = (
    quality: IterationNode,
    extent: IterationNode,
    alterations: IterationNode,
  ) => {
    if (isImplicitPower(quality, extent, alterations)) {
      this.#c.quality = QualityPower;
    } else if (isImplicitMajor(quality, extent, alterations)) {
      this.#c.quality = QualityMajor;
    } else if (isImplicitDominant(quality, extent, alterations)) {
      this.#c.quality = QualityDominant;
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

    if (!this.#c.alterations || this.#c.alterations.length === 0) {
      this.#c.alterations = [];
    }

    this.#c.alterations.push(
      ...alterations.children.map((alterationNode) =>
        alterationNode.sourceString
      ),
    );

    return this.#c;
  };
  extent = (arg0: NonterminalNode) => {
    arg0.eval();
    return this.#c;
  };
  thirteen = (_arg0: NonterminalNode) => {
    this.#c.extent = 13;
    return this.#c;
  };
  eleven = (_arg0: NonterminalNode) => {
    this.#c.extent = 11;
    return this.#c;
  };
  nine = (_arg0: NonterminalNode) => {
    this.#c.extent = 9;
    return this.#c;
  };
  seven = (_arg0: NonterminalNode) => {
    this.#c.extent = 7;
    return this.#c;
  };
  six_and_nine = (
    _arg0: NonterminalNode,
    _arg1: IterationNode,
    _arg2: NonterminalNode,
  ) => {
    this.#c.extent = 6;
    if (!this.#c.alterations || this.#c.alterations.length === 0) {
      this.#c.alterations = [];
    }
    this.#c.alterations.push("(add 9)");
    return this.#c;
  };
  six = (_arg0: NonterminalNode) => {
    this.#c.extent = 6;
    return this.#c;
  };
  five = (_arg0: NonterminalNode) => {
    this.#c.extent = 5;
    return this.#c;
  };
  four = (_arg0: NonterminalNode) => {
    this.#c.extent = 4;
    return this.#c;
  };
  two = (_arg0: NonterminalNode) => {
    this.#c.extent = 2;
    return this.#c;
  };
  quality = (arg0: NonterminalNode) => {
    arg0.eval();
    return this.#c;
  };
  sus = (_arg0: NonterminalNode) => {
    this.#c.quality = QualitySuspended;
    return this.#c;
  };
  minor_major = (_arg0: NonterminalNode) => {
    this.#c.quality = QualityMinorMajor;
    this.#c.extent ||= 7;
    return this.#c;
  };
  minor_major_with_parens = (
    _arg0: NonterminalNode,
    _arg1: TerminalNode,
    _arg2: NonterminalNode,
    _arg3: NonterminalNode,
    _arg4: TerminalNode,
  ) => {
    this.#c.quality = QualityMinorMajor;
    this.#c.extent ||= 7;
    return this.#c;
  };
  augmented = (_arg0: NonterminalNode) => {
    this.#c.quality = QualityAugmented;
    return this.#c;
  };
  diminished = (_arg0: NonterminalNode) => {
    this.#c.quality = QualityDiminished;
    return this.#c;
  };
  dominant = (_arg0: NonterminalNode) => {
    this.#c.quality = QualityDominant;
    this.#c.extent ||= 7;
    return this.#c;
  };
  half_diminished = (_arg0: NonterminalNode) => {
    this.#c.quality = QualityMinor;
    if (!this.#c.alterations || this.#c.alterations.length === 0) {
      this.#c.alterations = [];
    }
    this.#c.alterations.push("b5");
    this.#c.extent ||= 7;
    return this.#c;
  };
  major = (_arg0: NonterminalNode) => {
    this.#c.quality = QualityMajor;
    return this.#c;
  };
  minor = (_arg0: NonterminalNode) => {
    this.#c.quality = QualityMinor;
    return this.#c;
  };
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

  semantics.addOperation("eval", new ChordActions(chord));
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

  semantics.addOperation("eval", new Actions(song));
  semantics(matchResult).eval();

  song.key ||= song.guessKey();

  return Ok(song);
}

function isRepeat(s: string): boolean {
  return AllRepeatedChordSymbols.includes(s);
}

class Actions implements SongActionDict<Song> {
  #s: Song;
  #currentSection: string | undefined;

  constructor(s: Song) {
    this.#s = s;
    this.#currentSection = undefined;
  }

  Song = (metadata: IterationNode, bars: NonterminalNode) => {
    metadata.children.forEach((e) => e.eval());
    bars.eval();
    return this.#s;
  };

  Sections = (maybeSection: IterationNode, bars: IterationNode) => {
    zip(maybeSection.children, bars.children).forEach(([section, bars2]) => {
      section.children.forEach((c2) => c2.eval());
      bars2.eval();
    });
    return this.#s;
  };

  // TODO: what an ugly hack. we can do better
  Section = (sectionName: IterationNode, _arg1: IterationNode) => {
    this.#currentSection = sectionName.sourceString;
    return this.#s;
  };

  Bars = (
    barline: NonterminalNode,
    barChords: IterationNode,
    closingBarlines: IterationNode,
  ) => {
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
      ).filter((s) => s.includes("|"))[0]; // TODO: hack
      const bar: Bar = {
        openBarline: <Barline> previousBarline,
        closeBarline: <Barline> thisBarline,
        name: this.#currentSection,
        chords,
      };
      previousBarline = thisBarline;
      this.#s.bars.push(bar);
    });

    return this.#s;
  };

  Chordish = (_arg0: NonterminalNode) => {
    return this.#s;
  };

  Chord = (_arg0: NonterminalNode, _arg1: NonterminalNode) => {
    return this.#s;
  };

  #passthroughMetaFunc = (
    _arg0: NonterminalNode,
    _arg2: NonterminalNode,
    value: IterationNode,
    _arg3: NonterminalNode,
  ) => {
    value.eval();
    return this.#s;
  };

  metaTitle = this.#passthroughMetaFunc;
  metaArtist = this.#passthroughMetaFunc;
  metaYear = this.#passthroughMetaFunc;
  metaSig = this.#passthroughMetaFunc;
  metaKey = this.#passthroughMetaFunc;

  metaTitleValue = (arg0: IterationNode) => {
    this.#s.title = arg0.sourceString;
    return this.#s;
  };
  metaArtistValue = (arg0: IterationNode) => {
    this.#s.artist = arg0.sourceString;
    return this.#s;
  };
  metaYearValue = (arg0: IterationNode) => {
    this.#s.year = arg0.sourceString;
    return this.#s;
  };
  metaSigValue = (arg0: IterationNode) => {
    this.#s.sig = arg0.sourceString;
    return this.#s;
  };
  metaKeyValue = (arg0: IterationNode) => {
    this.#s.key = arg0.sourceString;
    return this.#s;
  };
}
