import { groupsOf } from "../lib/array.ts";
import { type Chord, Major, Minor, type Quality } from "../theory/chord.ts";
import { Key, KeyFlavorMajor, KeyFlavorMinor } from "../theory/key.ts";
import { SharpSymbol } from "../theory/notation.ts";

export const MetadataKeys = [
  "title",
  "artist",
  "album",
  "year",
  "sig",
  "key",
] as const;

export type MetadataKeysType = typeof MetadataKeys[number];

export type Metadata = {
  [K in MetadataKeysType]?: K extends "key" ? Key | undefined
    : string | undefined;
};

export class Song {
  public title: string | undefined;
  public artist: string | undefined;
  public album: string | undefined;
  public year: string | undefined;
  public sig: string | undefined;
  public key: Key | undefined;
  public bars: Bar[];

  constructor(bars: Bar[], metadata?: Metadata) {
    this.bars = bars;
    this.title = metadata?.title;
    this.artist = metadata?.artist;
    this.album = metadata?.album;
    this.year = metadata?.year;
    this.sig = metadata?.sig;
    this.key = metadata?.key || this.guessKey();
  }

  // Returns a new Song transposed by `halfSteps`
  transpose(halfSteps: number): Song {
    const song = this.dup();

    song.key = song.key?.transpose(halfSteps);

    const flatsOrSharps = song.key?.accidentalPreference() || SharpSymbol;

    song.bars = song.bars.map((bar) => {
      bar.chords = bar.chords.map((chordish) => {
        switch (chordish) {
          case NoChord:
            return chordish;
          default:
            return chordish.transpose(halfSteps, flatsOrSharps);
        }
      });

      return bar;
    });

    return song;
  }

  formatKeyName(): string {
    return this.key?.format() || UnknownKey;
  }

  // returns a new Song, value-identical to this one
  dup(): Song {
    return new Song(
      [...this.bars],
      {
        title: this.title,
        artist: this.artist,
        album: this.album,
        year: this.year,
        sig: this.sig,
        key: this.key,
      },
    );
  }

  // pretty-print the song
  format(): string {
    let accumulator = "";

    if (this.title) accumulator += `title: ${this.title}\n`;
    if (this.artist) accumulator += `artist: ${this.artist}\n`;
    if (this.year) accumulator += `year: ${this.year}\n`;
    if (this.sig) accumulator += `sig: ${this.sig}\n`;
    if (this.key) accumulator += `key: ${this.formatKeyName()}\n`;

    let previousChord: string | undefined = undefined;
    const barsBySection = Map.groupBy(this.bars, ({ name }) => name || "");

    for (const [section, bars] of barsBySection) {
      if (section) accumulator += `\n${section}:`;
      const lines: string[][] = [[""]];

      groupsOf(bars, 4).forEach((barGroup: Bar[]) => {
        const line = [];
        let previousBarline: string | undefined = undefined;

        for (const bar of barGroup) {
          if (previousBarline != bar.openBarline) line.push(bar.openBarline);

          for (const chordish of bar.chords) {
            switch (chordish) {
              case NoChord: {
                line.push(NoChord);
                break;
              }
              default: {
                const c = chordish.print();
                line.push(c === previousChord ? "%" : c);
                previousChord = c;
                break;
              }
            }
          }

          line.push(bar.closeBarline);
          previousBarline = bar.closeBarline;
        }

        lines.push(line);
      });

      accumulator += lines.map((line) => line.join(" ")).join("\n");

      accumulator += "\n"; // line break between sections
    }

    if (!accumulator.endsWith("\n")) accumulator += "\n"; // ensure a trailing newline

    return accumulator;
  }

  private guessKey(): Key | undefined {
    if (this.key) return this.key;
    const c = this.getFirstChord()!;
    if (c === undefined) return undefined;

    switch (c.quality) {
      case Minor:
        return new Key(c.tonic, KeyFlavorMinor);
      case Major:
      default:
        return new Key(c.tonic, KeyFlavorMajor);
    }
  }

  // TODO: use a real signature class. could parser do this?
  parseSig(): { numerator: string; denominator: string } {
    let [numerator, denominator] = (this.sig || "").split("/");
    if (!numerator || !denominator) {
      numerator = "4";
      denominator = "4";
    }
    return { numerator, denominator };
  }

  private getFirstChord(): Chord | undefined {
    for (const chordish of this.bars![0]!.chords) {
      if (chordish === NoChord) continue;
      return chordish;
    }
    return undefined;
  }
}

export const NoChord = "N.C." as const;
export type Chordish = Chord | typeof NoChord;
export type ChordishQuality = Quality | "no-chord";
export const RepeatedChordSymbol = "%";
export const AllRepeatedChordSymbols = [
  RepeatedChordSymbol,
  "/",
  "-",
  "𝄎",
];

export const UnknownKey = "?" as const;

export type Bar = {
  chords: Array<Chordish>;
  openBarline: Barline;
  closeBarline: Barline;
  name: string | undefined;
};

export type Barline =
  | typeof SingleBarline
  | typeof DoubleBarline
  | OpenBarlineWithRepeats
  | CloseBarlineWithRepeats;

type OpenBarlineWithRepeats = `${singleOrDoubleBarline}${howMany | ""}:`;
type CloseBarlineWithRepeats = `:${howMany | ""}${singleOrDoubleBarline}`;
type howMany = `${number}${"x" | ""}`;

const DoubleBarline = "||";
const SingleBarline = "|";

type singleOrDoubleBarline =
  | typeof DoubleBarline
  | typeof SingleBarline;

export function printChordish(this: Readonly<Chordish>): string {
  switch (this) {
    case NoChord:
      return NoChord;
    default:
      return this.print();
  }
}
