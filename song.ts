import { Minor, printChord } from "./types.ts";
import {
  accidentalPreferenceForKey,
  canonicalizeKeyQualifier,
  conventionalizeKey,
  NoteRegex,
  transposeLetter,
} from "./utils.ts";
import {
  Chord,
  Letter,
  QualityMajor,
  QualityMinor,
  transposeChord,
} from "./chord.ts";

export type Song = {
  title: string | undefined;
  artist: string | undefined;
  year: string | undefined;
  sig: string | undefined;
  key: string | undefined;
  bars: Array<Bar>;
};

export const NoChord = "N.C." as const;
export type Chordish = Chord | typeof NoChord;

export type Bar = {
  chords: Array<Chordish>;
  openBarline: Barline;
  closeBarline: Barline;
};

export type Barline =
  | typeof SingleBarline
  | typeof DoubleBarline
  | BarlineWithRepeats;

export type BarlineWithRepeats =
  | typeof BarlineRepeatOpenDouble
  | typeof BarlineRepeatCloseDouble
  | typeof BarlineRepeatOpenSingle
  | typeof BarlineRepeatOpenSingle1
  | typeof BarlineRepeatOpenSingle2
  | typeof BarlineRepeatOpenSingle2x
  | typeof BarlineRepeatCloseSingle
  | typeof BarlineRepeatCloseSingle1
  | typeof BarlineRepeatCloseSingle2
  | typeof BarlineRepeatCloseSingle2x
  | typeof BarlineRepeatOpenDouble1
  | typeof BarlineRepeatOpenDouble1x
  | typeof BarlineRepeatOpenDouble2
  | typeof BarlineRepeatOpenDouble2x
  | typeof BarlineRepeatCloseDouble1
  | typeof BarlineRepeatCloseDouble1x
  | typeof BarlineRepeatCloseDouble2
  | typeof BarlineRepeatCloseDouble2x;

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

// BarRepeatSignifierOpen = (digit caseInsensitive<"x">?)? ":"
// BarRepeatSignifierClose = ":" (digit caseInsensitive<"x">?)?

export const DoubleBarline = "||";
export const SingleBarline = "|";

export function printChordish(this: Chordish): string {
  switch (this) {
    case NoChord:
      return NoChord;
    default:
      return printChord.bind(this)();
  }
}

// Returns a new Song transposed by `halfSteps`
// TODO: Class instance method
export function transposeSong(this: Readonly<Song>, halfSteps: number): Song {
  const song: Song = { ...this };

  const songKey = guessKey.bind(song)();

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
          return transposeChord.bind(chordish)(halfSteps, flatsOrSharps);
      }
    });

    return bar;
  });

  song.key = `${destinationKey}${keyQualifier}`;

  return song;
}

export function parseSig(this: Readonly<Song>): {
  numerator: string;
  denominator: string;
} {
  let [numerator, denominator] = (this.sig || "").split("/");
  if (!numerator || !denominator) {
    numerator = "4";
    denominator = "4";
  }
  return { numerator, denominator };
}

export function guessKey(this: Readonly<Song>): string {
  if (this.key) return this.key;
  const c = getFirstChord.bind(this)();
  if (c && c.quality === QualityMajor) {
    return c.tonic;
  } else if (c && c.quality === QualityMinor) {
    return `${c.tonic}m`;
  } else {
    return `${c?.tonic || "?"}`;
  }
}

function getFirstChord(this: Readonly<Song>): Chord | undefined {
  for (const chordish of this.bars![0]!.chords) {
    if (chordish === NoChord) continue;
    return chordish;
  }
}
