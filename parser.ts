// @deno-types="./grammar.ohm-bundle.d.ts"
import grammar from "./grammar.ohm-bundle";
import type { SongActionDict } from "./grammar.ohm-bundle.d.ts";
import { Bar, BarType, Err, guessKey, Ok, Result, Song } from "./types.ts";

export function Parse(rawSong: string): Result<Song> {
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
  const defaultMetaFunc = (_1: any, _2: any, value: any, _3: any) => {
    return value.eval();
  };
  const _Actions: SongActionDict<Song> = {
    Song(metadata, bars) {
      metadata.children.map((e) => e.eval());
      bars.eval();
      return s;
    },
    Bars(barline, bars, _2) {
      bars.children.forEach((barNode) => {
        const chords = barNode.children.map((chordNode) => {
          return chordNode.sourceString;
        });
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
