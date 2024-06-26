import { groupsOf } from "../lib/array.ts";
import { nonexhaustiveSwitchGuard } from "../lib/switch.ts";
import { TextFormatter } from "../formatter/chord/text_formatter.ts";
import { type Chord, ChordTypeName } from "../theory/chord.ts";
import { Key, Major as MajorKey, Minor as MinorKey } from "../theory/key.ts";
import { SharpSymbol } from "../theory/notation.ts";
import { Minor } from "../theory/interval.ts";
import {
  Chordish,
  NoChordTypeName,
  OptionalChord,
  OptionalChordTypeName,
  rehydrate as rehydrateChordish,
  RepeatedChordSymbol,
  RepeatPreviousChordTypeName,
  SongChordTypeName,
} from "./song/chordish.ts";
import { Barline } from "./song/barline.ts";

export * from "./song/chordish.ts";
export * from "./song/barline.ts";

export const TitleKey = "title" as const;
export const ArtistKey = "artist" as const;
export const AlbumKey = "album" as const;
export const YearKey = "year" as const;
export const SigKey = "sig" as const;
export const KeyKey = "key" as const;

export const MetadataKeys = [
  TitleKey,
  ArtistKey,
  AlbumKey,
  YearKey,
  SigKey,
  KeyKey,
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
        const { type } = chordish;
        switch (type) {
          case NoChordTypeName:
          case RepeatPreviousChordTypeName:
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
    return new Song([...this.bars], this.metadata());
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
        const line: string[] = [];
        let previousBarline: string | undefined = undefined;

        for (const bar of barGroup) {
          if (previousBarline != bar.openBarline) line.push(bar.openBarline);

          for (const chordish of bar.chords) {
            const { type } = chordish;
            switch (type) {
              case RepeatPreviousChordTypeName:
              case NoChordTypeName:
              case OptionalChordTypeName:
                line.push(chordish.print());
                break;
              case ChordTypeName: {
                const c = new TextFormatter(chordish).format();
                if (c === previousChord) {
                  line.push(RepeatedChordSymbol);
                } else {
                  line.push(c);
                  previousChord = c;
                }
                break;
              }
              default:
                nonexhaustiveSwitchGuard(type);
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

  private metadata(): Metadata {
    return {
      title: this.title,
      artist: this.artist,
      album: this.album,
      year: this.year,
      sig: this.sig,
      key: this.key,
    };
  }

  private guessKey(): Key | undefined {
    if (this.key) return this.key;
    const c = this.getFirstChord()!;
    if (c === undefined) return undefined;
    const chord = c.type === OptionalChordTypeName ? c.chord : c;
    const keyFlavor = (chord.quality.third === Minor) ? MinorKey : MajorKey;
    return new Key(chord.tonic, keyFlavor);
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

  private getFirstChord(): Chord | OptionalChord | undefined {
    return this.bars[0]?.chords?.find(
      (c): c is Chord | OptionalChord =>
        c.type === SongChordTypeName || c.type === OptionalChordTypeName,
    );
  }
}

export function rehydrate(s: Song): Song {
  s = Object.assign(new Song(s.bars), s);

  if (s.key) {
    const { tonic, flavor } = s.key;
    s.key = Object.assign(new Key(tonic, flavor), s.key);
  }

  if (!s.bars) return s;

  s.bars = s.bars.map((b) => {
    b.chords = b.chords.map(rehydrateChordish);
    return b;
  });

  return s;
}

export const UnknownKey = "?" as const;

export type Bar = {
  chords: Array<Chordish>;
  openBarline: Barline;
  closeBarline: Barline;
  name: string | undefined;
};
