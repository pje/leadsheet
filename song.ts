import { Minor, printChord } from "./types.ts";
import {
  accidentalPreferenceForKey,
  canonicalizeKeyQualifier,
  conventionalizeKey,
  NoteRegex,
  transposeLetter,
} from "./utils.ts";
import { Chord, Letter, transposeChord } from "./chord.ts";

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
  openBar: string;
  closeBar: string;
};

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
  return c ? printChord.bind(c)() : "?";
}

function getFirstChord(this: Readonly<Song>): Chord | undefined {
  for (const chordish of this.bars![0]!.chords) {
    if (chordish === NoChord) continue;
    return chordish;
  }
}
