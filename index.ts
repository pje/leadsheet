import "./global.d.ts";
import defaultSongRaw from "./songs/chelsea_bridge.txt";
import { ColorClass, Key, Letter, Minor, parseSig, Song } from "./types.ts";
import {
  accidentalPreferenceForKey,
  canonicalizeKeyQualifier,
  chordColor,
  conventionalizeKey,
  NoteRegex,
  transpose,
} from "./utils";
import { Parse } from "./parser";

const settings = {
  colorChords: false,
};

type State = {
  key: Key;
  song: string | undefined;
};

const defaultSong = (() => {
  const result = Parse(defaultSongRaw);
  if (result.error) {
    console.log(result.error);
    return;
  } else {
    return result.value;
  }
})()!;

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
  let previousChordColorClass: ColorClass | undefined = undefined;
  const songElement = document.getElementById("song")!;

  songElement.innerHTML = "";
  songElement.insertAdjacentHTML("beforeend", staffBar);

  song.bars.map((bar) => {
    const chords = bar.chords.map((c) => {
      const result = c == previousChord ? "/" : c;

      const colorClass = (["%", "/"].includes(result))
        ? previousChordColorClass
        : chordColor(c);

      previousChord = c;
      previousChordColorClass = colorClass;
      return `<div class="chord ${
        settings.colorChords && colorClass
      }">${result}</div>`;
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
        const result = Parse(rawSong);
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

  const result = Parse(str);
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

  let [songKeyLetter, keyQualifier]: [Letter, string] = songKey
    .textContent!.trim()
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
            destinationRelativeMajorKey,
          );
          const newRoot = conventionalizeKey(
            transpose(root, halfSteps, flatsOrSharps),
          );
          e.textContent = `${newRoot}${kind}`;
        }
      }
    },
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
