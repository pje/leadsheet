import grammar, { SongActionDict, SongGrammar } from "./grammar.ohm-bundle";
import "./global.d.ts";
import defaultSongRaw from "./songs/chelsea_bridge.txt";
import {
  Bar,
  BarType,
  parseSig,
  Letter,
  Result,
  Ok,
  Err,
  Song,
  Minor,
} from "./types.ts";
import {
  CanonicalizeKeyQualifier,
  NoteRegex,
  accidentalPreferenceForKey,
  conventionalizeKey,
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

  document.querySelector("#title-container .title")!.textContent =
    song.title || "";
  document.querySelector("#title-container .key")!.textContent = song.key || "";

  document.querySelector("#title-container .artist")!.textContent =
    song.artist || "";

  document.querySelector("#title-container .date")!.textContent =
    song.year || "";

  let previousChord: string | undefined = undefined;

  document.querySelector(".song")!.innerHTML = "";
  document.querySelector(".song")!.insertAdjacentHTML("beforeend", staffBar);

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

    document.querySelector(".song")!.insertAdjacentHTML("beforeend", html);
  });

  return song;
}

function bootstrap(): void {
  document
    .querySelector("#transpose-up")!
    .addEventListener("click", transposeSong.bind(null, 1));

  document
    .querySelector("#transpose-down")!
    .addEventListener("click", transposeSong.bind(null, -1));

  document
    .querySelector("#song")!
    .addEventListener("change", async (e: InputEvent) => {
      const f = (e.currentTarget as HTMLInputElement).files![0];
      const reader = new FileReader();

      reader.onload = function (evt) {
        const target = evt.target!;
        if (target.readyState != 2) {
          return;
        } else if (target.error) {
          console.error(`Error while reading file: ${target.error}`);
          return;
        }

        const rawSong = target.result as string;
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
  const songKey = document.querySelector("#title-container .key")!;

  const [songKeyLetter, keyQualifier]: [Letter, string] = songKey
    .textContent!.trim()
    .split(NoteRegex)
    .filter(Boolean) as [Letter, string];

  const destinationKey = conventionalizeKey(
    transpose(songKeyLetter, halfSteps)
  );

  const destinationRelativeMajorKey =
    CanonicalizeKeyQualifier(keyQualifier) == Minor
      ? conventionalizeKey(transpose(destinationKey, 3))
      : destinationKey;

  songKey.textContent = `${destinationKey}${keyQualifier}`;

  Array(...document.querySelectorAll(".bar .chord")).forEach((e) => {
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
  });

  const transposedOutputEl = document.querySelector("#transposed-steps")!;
  const oldTransposedOutput = parseInt(transposedOutputEl.textContent!);
  const newTransposedOutput = (oldTransposedOutput + halfSteps) % 12;
  transposedOutputEl.textContent = `${
    newTransposedOutput > 0 ? "+" : ""
  }${newTransposedOutput}`;

  if (newTransposedOutput == 0) {
    transposedOutputEl.classList.add("hidden");
  } else {
    transposedOutputEl.classList.remove("hidden");
  }
}

window.onload = bootstrap;

export default bootstrap; // just here to satisfy esbuild
