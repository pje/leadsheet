import { Minor, printChord } from "./types.ts";
import {
  accidentalPreferenceForKey,
  canonicalizeKeyQualifier,
  conventionalizeKey,
  NoteRegex,
  transpose,
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

export type Bar = {
  chords: Array<Chord>;
  openBar: string;
  closeBar: string;
};

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
    transpose(songKeyLetter, halfSteps),
  );

  const destinationRelativeMajorKey =
    canonicalizeKeyQualifier(keyQualifier) == Minor
      ? conventionalizeKey(transpose(destinationKey, 3))
      : destinationKey;

  const flatsOrSharps = accidentalPreferenceForKey(
    destinationRelativeMajorKey,
  );

  song.bars = song.bars.map((bar) => {
    bar.chords = bar.chords.map((chord) =>
      transposeChord.bind(chord)(halfSteps, flatsOrSharps)
    );

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
  return this.key || getFirstChord.bind(this)() || "?";
}

function getFirstChord(this: Readonly<Song>): string {
  return printChord.bind(this.bars![0]!.chords[0]!)();
}
