import grammar, { SongActionDict, SongGrammar } from "./grammar.ohm-bundle";
import "./global.d.ts";
import defaultSongRaw from "./songs/chelsea_bridge.txt";
import {
  Bar,
  BarType,
  Err,
  Letter,
  Minor,
  Ok,
  parseSig,
  Result,
  Song,
} from "./types.ts";
import {
  accidentalPreferenceForKey,
  canonicalizeKeyQualifier,
  conventionalizeKey,
  NoteRegex,
  transpose,
} from "./utils";

const defaultSong = (() => {
  const result = parseSong(defaultSongRaw, grammar);
  if (result.error) {
    console.log(result.error);
    return;
  } else {
    return result.value;
  }
})()!;

export function Actions(s: Song): SongActionDict<Song> {
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

function parseSong(rawSong: string, grammar: SongGrammar): Result<Song> {
  const match = grammar.match(rawSong);

  if (match.failed()) {
    return Err(match.message || "failed to parse song: empty error");
  }

  const song = {
    bars: [],
  };

  const matchResult = grammar.match(rawSong);
  const semantics = grammar.createSemantics();

  semantics.addOperation("eval", Actions(song));
  semantics(matchResult).eval();

  return Ok(song);
}

function loadSong(song: Song): Song {
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

  const titleCntnrElement = document.getElementById("title-container")!;

  titleCntnrElement.querySelector(".title")!.textContent = song.title || "";
  titleCntnrElement.querySelector(".key")!.textContent = song.key || "";
  titleCntnrElement.querySelector(".artist")!.textContent = song.artist || "";
  titleCntnrElement.querySelector(".date")!.textContent = song.year || "";

  let previousChord: string | undefined = undefined;

  const songElement = document.getElementById("song")!;

  songElement.innerHTML = "";
  songElement.insertAdjacentHTML("beforeend", staffBar);

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

    songElement.insertAdjacentHTML("beforeend", html);
  });

  setTransposedAmount(0);

  return song;
}

function bootstrap(): void {
  document
    .getElementById("transpose-up")!
    .addEventListener("click", transposeSong.bind(null, 1));

  document
    .getElementById("transpose-down")!
    .addEventListener("click", transposeSong.bind(null, -1));

  document
    .getElementById("songfile")!
    .addEventListener("change", async (e: Event) => {
      const f = (e.currentTarget as HTMLInputElement).files![0]!;
      const reader = new FileReader();

      reader.onload = function (evt) {
        const target = evt.target!;
        if (target.readyState != 2) {
          return;
        } else if (target.error) {
          console.error(`Error while reading file: ${target.error}`);
          return;
        }

        const rawSong = target.result! as string;
        const result = parseSong(rawSong, grammar);
        if (result.error) {
          console.error(result.error);
        } else {
          localStorage.setItem("loadedSong", rawSong);
          loadSong(result.value);
        }
      };

      reader.readAsText(f);
    });

  const lastLoadedSong = fetchLoadedSongFromLocalStorage();

  loadSong(lastLoadedSong || defaultSong);
}

function fetchLoadedSongFromLocalStorage(): Song | undefined {
  const str = localStorage.getItem("loadedSong");

  if (!str?.trim()) {
    return undefined;
  }

  const result = parseSong(str, grammar);
  if (result.error) {
    console.error(result.error);
    return undefined;
  } else {
    return result.value;
  }
}

function transposeSong(halfSteps: number): void {
  const songKey = document
    .getElementById("title-container")!
    .querySelector(".key")!;

  const [songKeyLetter, keyQualifier]: [Letter, string] = songKey
    .textContent!.trim()
    .split(NoteRegex)
    .filter(Boolean) as [Letter, string];

  const destinationKey = conventionalizeKey(
    transpose(songKeyLetter, halfSteps)
  );

  const destinationRelativeMajorKey =
    canonicalizeKeyQualifier(keyQualifier) == Minor
      ? conventionalizeKey(transpose(destinationKey, 3))
      : destinationKey;

  songKey.textContent = `${destinationKey}${keyQualifier}`;

  Array(...document.querySelectorAll<HTMLDivElement>(".bar .chord")).forEach(
    (e) => {
      const current = e.textContent?.trim();

      if (!!current) {
        const matches = current.match(NoteRegex);

        if (matches && matches[1]) {
          const root = matches[1] as Letter;
          const kind: string | undefined = matches[2];
          const flatsOrSharps = accidentalPreferenceForKey(
            destinationRelativeMajorKey
          );
          const newRoot = conventionalizeKey(
            transpose(root, halfSteps, flatsOrSharps)
          );
          e.textContent = `${newRoot}${kind}`;
        }
      }
    }
  );

  addTransposedAmount(halfSteps);
}

function _getTransposedAmountEl() {
  return document.getElementById("transposed-steps")!;
}

function setTransposedAmount(n: number, e = _getTransposedAmountEl()) {
  e.textContent = `${n > 0 ? "+" : ""}${n}`;
  n == 0 ? e.classList.add("hidden") : e.classList.remove("hidden");
}

function addTransposedAmount(halfSteps: number) {
  const transposedAmountEl = _getTransposedAmountEl();
  const oldTransposedBy = parseInt(transposedAmountEl.textContent!);
  const newTransposedBy = (oldTransposedBy + halfSteps) % 12;
  setTransposedAmount(newTransposedBy, transposedAmountEl);
}

window.onload = bootstrap;

export default bootstrap; // just here to satisfy esbuild
