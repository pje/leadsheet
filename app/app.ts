import { unicodeifyMusicalSymbols } from "../app/utils.ts";
import { ParseSong } from "../parser/parser.ts";
import {
  defaultFeatureFlags,
  FeatureFlagKeys,
  type FeatureFlagKeysType,
  render as renderSettings,
} from "./settings.ts";
import {
  type Clock,
  TimeEventListener,
} from "../lib/midi/time_event_listener.ts";
import {
  type Barline,
  type Chordish,
  NoChordTypeName,
  OptionalChordTypeName,
  RepeatedChordSymbol,
  RepeatPreviousChord,
  RepeatPreviousChordTypeName,
  type Song,
} from "../parser/song.ts";
import { type State } from "./state.ts";
import { Key, SigAccidental, SigAccidentalToSymbol } from "../theory/key.ts";
import {
  type AlterableDegree,
  type Chord,
  ChordTypeName,
  identifyDyad,
  identifyTriad,
} from "../theory/chord.ts";
import { nonexhaustiveSwitchGuard } from "../lib/switch.ts";
import { type Alteration, Sus2, Sus4 } from "../theory/chord/alteration.ts";
import { partition } from "../lib/array.ts";
import { DefaultChordFormatter } from "../theory/chord/formatter.ts";
import { DyadID, type as DyadType } from "../theory/chord/quality/dyad.ts";
import {
  TertianTriadID,
  type as TriadType,
} from "../theory/chord/quality/tertian_triad.ts";
import { type as TetradType } from "../theory/chord/quality/tertian_tetrad.ts";
import { Major, Minor } from "../theory/interval.ts";

const state: State = {
  song: undefined,
  transposedSteps: 0,
  settings: {
    featureFlags: defaultFeatureFlags,
    midiInputDeviceID: undefined,
  },
};

export async function bootstrap() {
  state.midiEventListener ||= new TimeEventListener(onBarAdvanced);

  await renderSettings(state.settings, state.midiEventListener);

  const lastLoadedSong = fetchLoadedSongFromLocalStorage();
  loadSong(lastLoadedSong || _loadDefaultSong()!);

  document.querySelectorAll("#settings input")!.forEach((el) => {
    el.addEventListener("change", (e: Event) => {
      const inputElement = <HTMLInputElement> e?.currentTarget;
      const ffKey = <FeatureFlagKeysType> inputElement.name;
      const enable = !!inputElement.checked;

      if (inputElement.name !== "" && FeatureFlagKeys.includes(ffKey)) {
        state.settings.featureFlags[ffKey].enabled = enable;
      }

      if (ffKey === "followMidiClockMessages") {
        if (enable) {
          state.midiEventListener!.install();
        } else {
          state.midiEventListener!.uninstall();
        }
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
    .addEventListener("change", (e: Event) => {
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
  let previousChord: Chordish | undefined = undefined;
  let previousChordColorClass: ColorClass = CCNoChord;
  let previousSection: string | undefined = undefined;

  const songElement = rootElement.querySelector("#song")!;
  songElement.innerHTML = "";

  song.bars.map((bar) => {
    const chords = bar.chords.map((chordish) => {
      const formattedChordName = _formatChordName(chordish);

      let colorClass: ColorClass;
      let result: string;

      if (chordish.type === RepeatPreviousChordTypeName) {
        colorClass = previousChordColorClass;
        result = _formatChordName(chordish);
      } else {
        colorClass = _getColorClass(chordish);
        if (previousChord) {
          result = formattedChordName === _formatChordName(previousChord)
            ? RepeatedChordSymbol
            : formattedChordName;
        } else {
          result = formattedChordName;
        }
      }

      previousChord = chordish;
      previousChordColorClass = colorClass;
      const classes = [
        "chord",
        `${state.settings.featureFlags.colorChords.enabled && colorClass}`,
        `sibling-count-${bar.chords.length - 1}`,
      ];
      return `<div class="${classes.join(" ")}">${result}</div>`;
    });

    const staffClasses = ["staff"];
    const barlineOpenClass = _getBarlineClass(bar.openBarline, "open");
    const barlineCloseClass = _getBarlineClass(bar.closeBarline, "close");

    const barlineOpen = `<div class=${barlineOpenClass}></div>`;
    const barlineClose = `<div class=${barlineCloseClass}></div>`;

    const sectionNameElement = bar.name && previousSection !== bar.name
      ? `<div class="section-name">${bar.name}</div>`
      : "";
    const html = `<div class="bar flex-col">
  ${sectionNameElement}
  <div class="chords">
    ${chords.join("")}
  </div>
  <div class="${staffClasses.join(" ")}">
    ${barlineOpen}
    <div class="content"></div>
    ${barlineClose}
  </div>
</div>`;

    songElement.insertAdjacentHTML("beforeend", html);

    previousSection = bar.name;
  });
}

function renderClefAndSignatures(
  song: Readonly<Song>,
  rootElement: HTMLElement = document.getElementById("root")!,
) {
  const { numerator, denominator } = song.parseSig();

  let keySignatureEl = "";
  if (song.key && state.settings.featureFlags.keySignature.enabled) {
    const accidentals = song.key.signature();
    const accidentalToElement = (a: SigAccidental) => {
      const symbol = SigAccidentalToSymbol.get(a)!;
      const classes = [
        "accidental",
        ...(a.split("").map((c) =>
          c.replace("#", "sharp").replace("b", "flat").toLowerCase() // "Bb" => ["b", "flat"]
        )),
      ];

      return `<span class="${classes.join(" ")}">${symbol}</span>`;
    };
    const accidentalElements = accidentals.map(accidentalToElement);
    keySignatureEl = `<div class="key-signature">
  ${accidentalElements.join("\n")}
</div>`;
  }

  const clef = "𝄞";

  const frontmatter = `<div class="frontmatter">
  <div class="clef treble">${clef}</div>
  ${keySignatureEl}
  <div class="time-signature">
    <div class="numerator">${numerator}</div>
    <div class="slash" hidden>/</div>
    <div class="denominator">${denominator}</div>
  </div>
</div>`;

  const firstBarStaffElement = rootElement.querySelector(
    ".bar:first-child .staff",
  )!;
  firstBarStaffElement.insertAdjacentHTML(
    "afterbegin",
    frontmatter,
  );
  firstBarStaffElement.classList.add("flex-row", "flex-justify-start");
}

function renderMetadata(
  song: Readonly<Song>,
  rootElement: HTMLElement = document.getElementById("root")!,
) {
  const metadataElement = rootElement.querySelector("#metadata")!;

  const formattedSongKey = song.key && song.key
    ? _formatKeyName(song.key)
    : "?";

  metadataElement.querySelector(".title")!.textContent = song.title || "";
  metadataElement.querySelector(".key")!.textContent = "";
  metadataElement.querySelector(".key")!.insertAdjacentHTML(
    "afterbegin",
    formattedSongKey,
  );
  metadataElement.querySelector(".artist")!.textContent = song.artist || "";
  metadataElement.querySelector(".album")!.textContent = song.album || "";
  metadataElement.querySelector(".date")!.textContent = song.year || "";
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
  const transposedSong: Song = state.song!.transpose(halfSteps);
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

function onBarAdvanced(c: Readonly<Clock>) {
  const songLength = state.song?.bars.length;
  const activeBar = songLength ? c.bars % songLength : c.bars;

  document.querySelectorAll(`#song .bar.active`)?.forEach((node) =>
    node.classList.remove("active")
  );

  document.querySelector(`#song .bar:nth-child(${activeBar + 1})`) // nth-child starts at 1, not 0
    ?.classList?.add(
      "active",
    );
}

function _getTransposedAmountEl() {
  return document.getElementById("transposed-steps")!;
}

const FancyHTMLFormatter = class extends DefaultChordFormatter {
  override alterations(as: Array<Alteration>) {
    if (as.length < 2) return super.alterations(as);

    const [parenable, rest] = partition(
      as,
      (a: Alteration) => ["lower", "raise", "add", "omit"].includes(a.kind),
    );

    if (parenable.length < 2) return super.alterations(as);

    parenable.sort((a, b) =>
      <AlterableDegree> b.target - <AlterableDegree> a.target
    );

    const fractionalContent = parenable.map((a) => {
      return `<span>${a.print()}</span>`;
    });

    return [
      super.alterations(rest),
      `<span class="paren-open">(</span>`,
      `<span class="fractional">${fractionalContent.join("")}</span>`,
      `<span class="paren-close">)</span>`,
    ].join("");
  }
};

function _formatChordName(c: Readonly<Chordish>): string {
  const printed = c.print(new FancyHTMLFormatter());
  return state.settings.featureFlags.unicodeChordSymbols.enabled
    ? unicodeifyMusicalSymbols(printed)
    : printed;
}

type ChordishWithoutRepeats = Exclude<Chordish, RepeatPreviousChord>;

function _getColorClass(c: Readonly<ChordishWithoutRepeats>): ColorClass {
  const { type } = c;

  switch (type) {
    case NoChordTypeName:
      return CCNoChord;
    case OptionalChordTypeName:
      return _getColorClassForChord(c.chord);
    case ChordTypeName:
      return _getColorClassForChord(c);
    default:
      nonexhaustiveSwitchGuard(type);
  }
}

function _getColorClassForChord(c: Readonly<Chord>): ColorClass {
  const { quality: q } = c;
  const { type } = q;

  switch (type) {
    case DyadType:
      return identifyDyad(q);
    case TriadType:
    case TetradType: {
      if (q.third === Major && q.seventh === Minor) return CCDom;
      if (c.alterations.includes(Sus2) || c.alterations.includes(Sus4)) {
        return CCSus;
      }
      return identifyTriad(q) || CCNoChord;
    }
    default:
      nonexhaustiveSwitchGuard(type);
  }
}

function _getBarlineClass(
  c: Barline,
  sfx: "open" | "close",
): `barline-${"single" | "double" | "repeat"}-${typeof sfx}` {
  const result = (c === "|")
    ? `barline-single-${sfx}` as const
    : (c === "||")
    ? `barline-double-${sfx}` as const
    : (c.match(/\|\d*x?:/))
    ? "barline-repeat-open" as const
    : (c.match(/:\d*x?\|/))
    ? "barline-repeat-close" as const
    : `barline-single-${sfx}` as const;

  return result;
}

function _formatKeyName(key: Key): string {
  const str = `${key.tonic}${key.flavor}`;
  return state.settings.featureFlags.unicodeChordSymbols.enabled
    ? unicodeifyMusicalSymbols(str)
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

type ColorClass =
  | TertianTriadID
  | DyadID
  | typeof CCDom
  | typeof CCNoChord
  | typeof CCSus;

const CCDom = "dom" as const;
const CCNoChord = "no-chord" as const;
const CCSus = "sus" as const;

const defaultSongRaw = `title: Chelsea Bridge
artist: Billy Strayhorn
year: 1941
sig: 4/4
key: Bbm

| N.C. |

A:
|: BbmM7 | AbmM7 | BbmM7 AbmM7 | Bb7 |
| Ebm9 | Ab13 | Db6 | % (C7) (B7) :|

B:
| F#m7 B7 | EM7 C#m7 | F#m7 B7(b9)(#5) | Bm7 E7 |
| AM7 (Am7) (D7) | GM7 | Gm C9 | Db7(#11) (C7) (B7) ||

C:
| BbmM7 | AbmM7 | BbmM7 AbmM7 | Bb7 |
| Ebm9 | Ab13 | Db6 | % (C7) (B7) ||
`;
