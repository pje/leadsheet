import "./global.d.ts";
import defaultSongRaw from "./songs/chelsea_bridge.leadsheet";
import {
  Chord,
  ChordQuality,
  parseSig,
  printChord,
  RepeatedChordSymbol,
  Song,
  transposeSong,
} from "./types.ts";
import { superscriptize, titleize, unicodeifyMusicalSymbols } from "./utils.ts";
import { ParseSong } from "./parser/parser.ts";
import { defaultSettings, Settings, SettingsKeys } from "./settings.ts";

const state: {
  song: Song | undefined;
  transposedSteps: number;
  settings: Settings;
} = {
  song: undefined,
  transposedSteps: 0,
  settings: defaultSettings,
};

function bootstrap(): void {
  renderSettings(state.settings);

  const lastLoadedSong = fetchLoadedSongFromLocalStorage();
  loadSong(lastLoadedSong || _loadDefaultSong()!);

  document.querySelectorAll("#settings input")!.forEach((el) => {
    el.addEventListener("change", async (e: Event) => {
      const inputElement = <HTMLInputElement> e?.currentTarget;
      const settingKey = <typeof SettingsKeys[number]> inputElement.name;

      if (inputElement.name !== "" && SettingsKeys.includes(settingKey)) {
        state.settings[settingKey].enabled = !!inputElement.checked;
      }

      renderSong(state.song!);
    });
  });

  document
    .getElementById("transpose-up")!
    .addEventListener("click", handleTransposeSong.bind(null, 1));

  document
    .getElementById("transpose-down")!
    .addEventListener("click", handleTransposeSong.bind(null, -1));

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
        const result = ParseSong(rawSong);
        if (result.error) {
          console.error(result.error);
        } else {
          localStorage.setItem("loadedSong", rawSong);
          loadSong(result.value);
        }
      };

      reader.readAsText(f);
    });
}

function renderSong(
  song: Readonly<Song>,
  rootElement: HTMLElement = document.getElementById("root")!,
) {
  renderMetadata(song, rootElement);
  renderBars(song, rootElement);
  renderClefAndSignatures(song, rootElement);
}

function renderBars(
  song: Readonly<Song>,
  rootElement: HTMLElement = document.getElementById("root")!,
) {
  let previousChord: Chord | undefined = undefined;
  let previousChordColorClass: ChordQuality | undefined = undefined;
  const songElement = rootElement.querySelector("#song")!;
  songElement.innerHTML = "";

  song.bars.map((bar) => {
    const chords = bar.chords.map((c) => {
      const formattedChordName = _formatChordName(c);
      const [result, colorClass] = previousChord && previousChordColorClass &&
          _formatChordName(previousChord) === formattedChordName
        ? [RepeatedChordSymbol, previousChordColorClass]
        : [formattedChordName, c.quality!];

      previousChord = c;
      previousChordColorClass = colorClass;
      return `<div class="chord ${
        state.settings.colorChords.enabled && colorClass
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
}

function renderClefAndSignatures(
  song: Readonly<Song>,
  rootElement: HTMLElement = document.getElementById("root")!,
) {
  const { numerator, denominator } = parseSig.bind(song)();

  const staffElements = `
  <div class="clef treble">𝄞</div>
  <div class="time-signature">
    <div class="numerator">${numerator}</div>
    <div class="slash" hidden>/</div>
    <div class="denominator">${denominator}</div>
  </div>`;

  const firstBarStaffElement = rootElement.querySelector(
    ".bar:first-child .staff",
  )!;
  firstBarStaffElement.insertAdjacentHTML(
    "afterbegin",
    staffElements,
  );
  firstBarStaffElement.classList.add("flex-row", "flex-justify-start");
}

function renderMetadata(
  song: Readonly<Song>,
  rootElement: HTMLElement = document.getElementById("root")!,
) {
  const metadataElement = rootElement.querySelector("#metadata")!;

  const formattedSongKey = song.key && song.key !== ""
    ? _formatKeyName(song.key)
    : "?";

  metadataElement.querySelector(".title")!.textContent = song.title || "";
  metadataElement.querySelector(".key")!.textContent = formattedSongKey;
  metadataElement.querySelector(".artist")!.textContent = song.artist || "";
  metadataElement.querySelector(".date")!.textContent = song.year || "";
}

function renderSettings(
  settings: Readonly<typeof state.settings>,
  rootElement: HTMLElement = document.getElementById("root")!,
) {
  const settingsElement = rootElement.querySelector("#settings")!;
  settingsElement.innerHTML = "";

  const html = Object.entries(settings).map(
    ([identifier, { enabled, description }]) =>
      `<label title="${description}">
  ${titleize(identifier)}
  <input type="checkbox" name="${identifier}" ${enabled ? "checked" : ""}/>
</label>`,
  ).join("\n");

  settingsElement.insertAdjacentHTML(
    "beforeend",
    "<summary>Settings</summary>",
  );
  settingsElement.insertAdjacentHTML("beforeend", html);
}

// TODO: Action
function loadSong(song: Song): Song {
  state.song = song;
  setTransposedAmount(0);
  renderSong(song, document.getElementById("root")!);
  return song;
}

// TODO: Action
function fetchLoadedSongFromLocalStorage(): Song | undefined {
  const str = localStorage.getItem("loadedSong");

  if (!str?.trim()) {
    return undefined;
  }

  const result = ParseSong(str);
  if (result.error) {
    console.error(result.error);
    return undefined;
  } else {
    return result.value;
  }
}

// TODO: Action
function handleTransposeSong(halfSteps: number): void {
  const transposedSong: Song = transposeSong.bind(state.song!)(halfSteps);
  state.song = transposedSong;
  renderSong(transposedSong);
  addTransposedAmount(halfSteps);
}

// TODO: Action
function setTransposedAmount(n: number, e = _getTransposedAmountEl()) {
  state.transposedSteps = n;
  e.textContent = `${n > 0 ? "+" : ""}${n}`;
  n == 0 ? e.classList.add("hidden") : e.classList.remove("hidden");
}

// TODO: Action
function addTransposedAmount(halfSteps: number) {
  const transposedAmountEl = _getTransposedAmountEl();
  const oldTransposedBy = parseInt(transposedAmountEl.textContent!);
  const newTransposedBy = (oldTransposedBy + halfSteps) % 12;
  setTransposedAmount(newTransposedBy, transposedAmountEl);
}

function _getTransposedAmountEl() {
  return document.getElementById("transposed-steps")!;
}

function _formatChordName(c: Readonly<Chord>): string {
  const printed = printChord.bind(c)();
  return state.settings.unicodeChordSymbols.enabled
    ? unicodeifyMusicalSymbols(superscriptize(printed))
    : printed;
}

function _formatKeyName(str: string): string {
  return state.settings.unicodeChordSymbols.enabled
    ? unicodeifyMusicalSymbols(superscriptize(str))
    : str;
}

function _loadDefaultSong(): Song | undefined {
  const result = ParseSong(defaultSongRaw);
  if (result.error) {
    console.log(result.error);
    return;
  } else {
    return result.value;
  }
}

window.onload = bootstrap;

export default bootstrap; // just here to satisfy esbuild
