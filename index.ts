import grammar, { SongActionDict, SongGrammar } from "./grammar.ohm-bundle";
import "./global.d.ts";
import defaultSong from "./songs/chelsea_bridge.txt";
import { Grammar } from "./node_modules/ohm-js/index";
import {
  Bar,
  BarType,
  parseSig,
  DegreesToKeys,
  KeysToDegrees,
  Letter,
  Song,
} from "./types";
import { replaceDupesWithRepeats } from "./utils";

export function Actions(s: Song): SongActionDict<Song> {
  const defaultMetaFunc = (_1, _2, value, _3) => {
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
    Chord(chordExpOrRepeat) {
      return s;
    },
    ChordExp(root, flavor) {
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

function parse(fileBuffer: string, grammar: SongGrammar): Song {
  const song = {
    bars: [],
  };

  const matchResult = grammar.match(fileBuffer);
  const semantics = grammar.createSemantics();

  semantics.addOperation("eval", Actions(song));
  semantics(matchResult).eval();

  return song;
}

function loadSong(rawSong: string): Song {
  const match = grammar.match(rawSong);

  if (match.failed()) {
    console.log(match.message);
    return;
  }

  const song = parse(rawSong, grammar);
  const { numerator, denominator } = parseSig(song);

  const staffBar = `
  <div class="bar">
    <div class="chords"><div class="chord"></div></div>
    <div class="staff flex-row">
      <div class="clef">𝄞</div>
      <div class="time-signature">
        <div class="numerator">${numerator}</div>
        <div class="slash" hidden>/</div>
        <div class="denominator">${denominator}</div>
      </div>
    </div>
  </div>`;

  document.querySelector(".title-container .title").textContent = song.title;
  document.querySelector(".title-container .key").textContent = song.key;
  // document.querySelector(".song .numerator").textContent = numerator;
  // document.querySelector(".song .denominator").textContent = denominator;

  let previousChord: string | undefined = undefined;

  document.querySelector(".song").innerHTML = "";

  document.querySelector(".song").insertAdjacentHTML("beforeend", staffBar);

  song.bars.map((bar) => {
    const chords = bar.chords.map((c) => {
      const result = c == previousChord ? "/" : c;
      previousChord = c;
      return `<div class="chord">${result}</div>`;
    });

    const html = `<div class="bar">
      <div class="chords">
        ${chords.join("")}
      </div>
      <div class="staff"></div>
    </div>`;

    document.querySelector(".song").insertAdjacentHTML("beforeend", html);
  });

  return song;
}

function bootstrap(): void {
  document
    .querySelector("#transpose-up")
    .addEventListener("click", transposeSong.bind(null, 1));

  document
    .querySelector("#transpose-down")
    .addEventListener("click", transposeSong.bind(null, -1));

  document
    .querySelector("#song")
    .addEventListener("change", async (e: InputEvent) => {
      const f = (e.currentTarget as HTMLInputElement).files[0];
      const reader = new FileReader();

      reader.onload = function (evt) {
        if (evt.target.readyState != 2) {
          return;
        } else if (evt.target.error) {
          console.error(`Error while reading file: ${evt.target.error}`);
          return;
        }

        const rawSong = evt.target.result as string;
        loadSong(rawSong);
      };

      reader.readAsText(f);
    });
  loadSong(defaultSong);
}

function transpose(key: Letter, halfSteps: number): Letter {
  const currentDegree = KeysToDegrees.get(key);
  let newDegree = (currentDegree + halfSteps) % DegreesToKeys.length;
  if (newDegree < 0) {
    newDegree = DegreesToKeys.length + newDegree;
  }
  return DegreesToKeys[newDegree];
}

const noteRegex = /^([A-G]{1}(?:[b#♯♭])?)(.*)$/;

function transposeSong(halfSteps: number): void {
  const songKey = document.querySelector(".title-container .key");
  const [songKeyLetter, whatever] = songKey.textContent // support "CM" or "C major" or "C Dorian"
    .trim()
    .split(noteRegex)
    .filter(Boolean);

  const transposedSongKeyLetter = transpose(songKeyLetter as Letter, halfSteps);

  songKey.textContent = `${transposedSongKeyLetter}${whatever}`;

  Array(...document.querySelectorAll(".bar .chord")).forEach((e) => {
    const current = e.textContent.trim();

    if (!!current) {
      const matches = current.match(noteRegex);

      if (matches && matches[1]) {
        const root = matches[1] as Letter;
        const kind: string | undefined = matches[2];

        const newRoot = transpose(root, halfSteps);
        e.textContent = `${newRoot}${kind}`;
      }
    }
  });
}

window.onload = bootstrap;

export default bootstrap; // just here to satisfy esbuild
