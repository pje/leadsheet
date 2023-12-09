// @deno-types="./grammar.ohm-bundle.d.ts"
import grammar from "./grammar.ohm-bundle.js";
import type {
  IterationNode as INode,
  NonterminalNode as NNode,
  TerminalNode as TNode,
} from "ohm-js";
import type { ChordActionDict, SongActionDict } from "./grammar.ohm-bundle.js";
import {
  Bar,
  Barline,
  Chord,
  Chordish,
  ChordQuality,
  Extent,
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

function normalizeLetter(str: string): string {
  return str.toUpperCase();
}

function normalizeAccidentals(str: string): string {
  return str.replace("♯", "#").replace("♭", "b");
}

class ChordActions implements ChordActionDict<Chord> {
  #c: Chord;

  constructor(c: Chord) {
    this.#c = c;
  }

  Chord = (root: NNode, flavor: NNode) => {
    root.eval();
    flavor.eval();
    return this.#c;
  };

  root = (root: NNode, accidentals: INode) => {
    this.#c.tonic = <Letter> [
      normalizeLetter(root.sourceString),
      normalizeAccidentals(accidentals.sourceString),
    ].join("");

    return this.#c;
  };

  flavor = (quality: INode, extent: INode, alterations: INode) => {
    isImplicitPower(quality, extent)
      ? this.#c.quality = QualityPower
      : isImplicitMajor(quality, extent)
      ? this.#c.quality = QualityMajor
      : isImplicitDominant(quality, extent)
      ? this.#c.quality = QualityDominant
      : quality.child(0)?.eval();

    extent.child(0)?.eval();

    this.#c.alterations.push(
      ...alterations.children.map((alteration) => alteration.sourceString),
    );

    return this.#c;
  };

  #evalPassthrough = (n: NNode) => {
    n.eval();
    return (this.#c);
  };

  #qualityPassthrough = (quality: ChordQuality) => {
    return (_: NNode) => {
      this.#c.quality = quality;
      return this.#c;
    };
  };

  #extentPassthrough = (extent: Extent) => {
    return (_: NNode) => {
      this.#c.extent = extent;
      return this.#c;
    };
  };

  extent = this.#evalPassthrough;
  thirteen = this.#extentPassthrough(13);
  eleven = this.#extentPassthrough(11);
  nine = this.#extentPassthrough(9);
  seven = this.#extentPassthrough(7);
  six = this.#extentPassthrough(6);
  five = this.#extentPassthrough(5);
  four = this.#extentPassthrough(4);
  two = this.#extentPassthrough(2);
  six_and_nine = (_0: NNode, _1: INode, _2: NNode) => {
    this.#c.extent = 6;
    this.#c.alterations.push("(add 9)");
    return this.#c;
  };

  quality = this.#evalPassthrough;
  augmented = this.#qualityPassthrough(QualityAugmented);
  diminished = this.#qualityPassthrough(QualityDiminished);
  major = this.#qualityPassthrough(QualityMajor);
  minor = this.#qualityPassthrough(QualityMinor);
  sus = this.#qualityPassthrough(QualitySuspended);
  dominant = (_0: NNode) => {
    this.#c.quality = QualityDominant;
    this.#c.extent ||= 7;
    return this.#c;
  };
  half_diminished = (_0: NNode) => {
    this.#c.quality = QualityMinor;
    this.#c.alterations.push("b5");
    this.#c.extent ||= 7;
    return this.#c;
  };
  minor_major = (_0: NNode) => {
    this.#c.quality = QualityMinorMajor;
    this.#c.extent ||= 7;
    return this.#c;
  };
  minor_major_with_parens = (
    _0: NNode,
    _1: TNode,
    _2: NNode,
    _3: NNode,
    _4: NNode,
  ) => this.minor_major(_0);
}

class SongActions implements SongActionDict<Song> {
  #s: Song;
  #currentSection: string | undefined;

  constructor(s: Song) {
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
    return this.#s;
  };

  Section = (sectionName: INode, _1: INode) => {
    // TODO: get rid of the statefulness here
    this.#currentSection = sectionName.sourceString;
    return this.#s;
  };

  Bars = (barline: NNode, barChords: INode, closingBarlines: INode) => {
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

  Chordish = (_0: NNode) => this.#s;

  Chord = (_0: NNode, _1: NNode) => this.#s;

  #metaPassthrough = (_0: NNode, _2: NNode, value: INode, _arg3: NNode) => {
    value.eval();
    return this.#s;
  };

  metaTitle = this.#metaPassthrough;
  metaArtist = this.#metaPassthrough;
  metaYear = this.#metaPassthrough;
  metaSig = this.#metaPassthrough;
  metaKey = this.#metaPassthrough;

  #metaValuePassthrough = (
    property: "title" | "artist" | "year" | "sig" | "key",
  ) => {
    return (arg0: INode) => {
      this.#s[property] = arg0.sourceString;
      return this.#s;
    };
  };

  metaTitleValue = this.#metaValuePassthrough("title");
  metaArtistValue = this.#metaValuePassthrough("artist");
  metaYearValue = this.#metaValuePassthrough("year");
  metaSigValue = this.#metaValuePassthrough("sig");
  metaKeyValue = this.#metaValuePassthrough("key");
}

export function ParseChord(rawChord: string): Result<Chord> {
  const matchResult = grammar.Chord.match(rawChord, "Chord");
  if (matchResult.failed()) return Err(matchResult.message!);
  const semantics = grammar.Chord.createSemantics();
  semantics.addOperation("eval", new ChordActions(new Chord()));
  const chord = semantics(matchResult).eval();
  return Ok(chord);
}

export function ParseSong(rawSong: string): Result<Song> {
  const matchResult = grammar.Song.match(rawSong, "Song");
  if (matchResult.failed()) return Err(matchResult.message!);
  const semantics = grammar.Song.createSemantics();
  semantics.addOperation("eval", new SongActions(new Song()));
  const song = semantics(matchResult).eval();
  song.key ||= song.guessKey();
  return Ok(song);
}

const isRepeat = (s: string) => {
  return AllRepeatedChordSymbols.includes(s);
};

const isImplicitMajor = (quality: INode, extent: INode) => (
  !quality.sourceString &&
  (extent.sourceString.trim() === "" || extent.sourceString.startsWith("6"))
);

const isImplicitDominant = (quality: INode, extent: INode) => (
  !quality.sourceString &&
  ["7", "9", "11", "13", "alt"].some((s) => extent.sourceString.startsWith(s))
);

const isImplicitPower = (quality: INode, extent: INode) => (
  !quality.sourceString && extent.sourceString.startsWith("5")
);
