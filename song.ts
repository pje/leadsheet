import { Minor } from "./types.ts";
import {
  accidentalPreferenceForKey,
  canonicalizeKeyQualifier,
  conventionalizeKey,
  NoteRegex,
  transposeLetter,
} from "./utils.ts";
import {
  Chord,
  ChordQuality,
  Letter,
  QualityMajor,
  QualityMinor,
} from "./chord.ts";

export class Song {
  public title: string | undefined;
  public artist: string | undefined;
  public year: string | undefined;
  public sig: string | undefined;
  public key: string | undefined;
  public bars: Array<Bar>;

  constructor(
    bars?: Array<Bar>,
    metadata?: {
      title?: string | undefined;
      artist?: string | undefined;
      year?: string | undefined;
      sig?: string | undefined;
      key?: string | undefined;
    },
  ) {
    this.bars = bars || [];
    this.title = metadata?.title;
    this.artist = metadata?.artist;
    this.year = metadata?.year;
    this.sig = metadata?.sig;
    this.key = metadata?.key;
  }

  // Returns a new Song transposed by `halfSteps`
  transpose(halfSteps: number): Song {
    const song = this.dup();

    const songKey = song.guessKey();

    let [songKeyLetter, keyQualifier]: [Letter, string] = songKey
      .trim()
      .split(NoteRegex)
      .filter(Boolean) as [Letter, string];

    keyQualifier ||= "M";

    const destinationKey = conventionalizeKey(
      transposeLetter(songKeyLetter, halfSteps),
    );

    const destinationRelativeMajorKey =
      canonicalizeKeyQualifier(keyQualifier) == Minor
        ? conventionalizeKey(transposeLetter(destinationKey, 3))
        : destinationKey;

    const flatsOrSharps = accidentalPreferenceForKey(
      destinationRelativeMajorKey,
    );

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

    song.key = `${destinationKey}${keyQualifier}`;

    return song;
  }

  // returns a new Song, value-identical to this one
  dup(): Song {
    return new Song(
      [...this.bars],
      {
        title: this.title,
        artist: this.artist,
        year: this.year,
        sig: this.sig,
        key: this.key,
      },
    );
  }

  guessKey(): string {
    if (this.key) return this.key;
    const c = this.getFirstChord();
    if (c && c.quality === QualityMajor) {
      return c.tonic;
    } else if (c && c.quality === QualityMinor) {
      return `${c.tonic}m`;
    } else {
      return `${c?.tonic || "?"}`;
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
  }
}

export const NoChord = "N.C." as const;
export type Chordish = Chord | typeof NoChord;
export type ChordishQuality = ChordQuality | "no-chord";

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

export type OpenBarlineWithRepeats =
  `${singleOrDoubleBarline}${maybeDigit}${maybeX}:`;
export type CloseBarlineWithRepeats =
  `:${maybeDigit}${maybeX}${singleOrDoubleBarline}`;

export const BarlineRepeatOpenDouble = "||:" as const;
export const BarlineRepeatCloseDouble = ":||" as const;
export const BarlineRepeatOpenSingle = "|:" as const;
export const BarlineRepeatOpenSingle1 = "|1:" as const;
export const BarlineRepeatOpenSingle2 = "|2:" as const;
export const BarlineRepeatOpenSingle2x = "|2x:" as const;
export const BarlineRepeatCloseSingle = ":|" as const;
export const BarlineRepeatCloseSingle1 = ":1|" as const;
export const BarlineRepeatCloseSingle2 = ":2|" as const;
export const BarlineRepeatCloseSingle2x = ":2x|" as const;
export const BarlineRepeatOpenDouble1 = "||1:" as const;
export const BarlineRepeatOpenDouble1x = "||1x:" as const;
export const BarlineRepeatOpenDouble2 = "||2:" as const;
export const BarlineRepeatOpenDouble2x = "||2x:" as const;
export const BarlineRepeatCloseDouble1 = ":1||" as const;
export const BarlineRepeatCloseDouble1x = ":1x||" as const;
export const BarlineRepeatCloseDouble2 = ":2||" as const;
export const BarlineRepeatCloseDouble2x = ":2x||" as const;

export const DoubleBarline = "||";
export const SingleBarline = "|";

type singleOrDoubleBarline =
  | typeof DoubleBarline
  | typeof SingleBarline;
type maybeX = "x" | "";
type maybeDigit =
  | ""
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9;

export function printChordish(this: Readonly<Chordish>): string {
  switch (this) {
    case NoChord:
      return NoChord;
    default:
      return this.print();
  }
}
