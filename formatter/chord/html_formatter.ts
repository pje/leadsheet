import { compact, groupsOf, partition } from "../../lib/array.ts";
import {
  type AlterableDegree,
  AlterAdd,
  type Alteration,
  AlterCompound,
  AlterEverything,
  AlterLower,
  AlterMajor,
  AlterMinor,
  AlterOmit,
  AlterRaise,
  AlterSuspend,
  canonicalize,
  Chord,
  sort,
} from "../../theory/chord.ts";
import { Power_id } from "../../theory/chord/quality/dyad.ts";
import {
  Aug7_id,
  Dim7_id,
  DimM7_id,
  Dom7_id,
  Maj69_id,
  Maj6_id,
  Maj6Sh5_id,
  Maj7_id,
  Maj7Sh5_id,
  Min69_id,
  Min6_id,
  Min7_id,
  Min7Fl5_id,
  MinMaj7_id,
} from "../../theory/chord/quality/tetrad.ts";
import {
  Aug_id,
  Dim_id,
  Maj_id,
  Min_id,
} from "../../theory/chord/quality/triad.ts";
import { FlatSymbol, SharpSymbol } from "../../theory/notation.ts";
import { TextFormatter } from "./text_formatter.ts";

const tfi = new TextFormatter(new Chord("A"));

export const HTMLFormatter = class extends TextFormatter {
  #chord: Chord;

  constructor(c: Chord) {
    super(c);
    this.#chord = canonicalize(c);
  }

  override symbols = {
    ...(tfi.symbols),
    "#": uni("#"),
    "b": uni("b"),
    quality: {
      ...tfi.symbols.quality,
      [Aug_id]: "⁺",
      [Dim_id]: dim(),
      [Maj_id]: "" as const,
      [Min_id]: m,
      [Maj7_id]: (x: AlterableDegree) => `${M}${sup(x)}`,
      [Dom7_id]: (x: AlterableDegree) => `${sup(x)}`,
      [Min7_id]: (x: AlterableDegree) => `${m}${sup(x)}`,
      [Aug7_id]: (x: AlterableDegree) => `⁺${sup(x)}`,
      [Dim7_id]: (x: AlterableDegree) => `${dim()}${sup(x)}`,
      [DimM7_id]: (x: AlterableDegree) => `${dim()}${sup(M)}${sup(x)}`,
      [Maj7Sh5_id]: (x: AlterableDegree) => `⁺${sup(M)}${sup(x)}`,
      [Min7Fl5_id]: (x: AlterableDegree) =>
        `${m}${sup(x)}${sup(uni("b"))}${sup(5)}`,
      [MinMaj7_id]: (x: AlterableDegree) => `${m}${sup(M)}${sup(x)}`,
      [Maj6_id]: sup(6),
      [Min6_id]: `${m}${sup(6)}`,
      [Maj69_id]: `${sup(6)}${sup(slash)}${sup(9)}`,
      [Min69_id]: `m${sup(6)}${sup(slash)}${sup(9)}`,
      [Maj6Sh5_id]: `⁺${sup(6)}`,
      [Power_id]: sup(5),
    },
    alteration: {
      ...tfi.symbols.alteration,
      [AlterRaise]: (x: Alteration["target"]) => `${sup(uni("#"))}${sup(x)}`,
      [AlterLower]: (x: Alteration["target"]) => `${sup(uni("b"))}${sup(x)}`,
      [AlterMajor]: (x: Alteration["target"]) => `${sup(M)}${sup(x)}`,
      [AlterMinor]: (x: Alteration["target"]) => `${sup(m)}${sup(x)}`,
      [AlterAdd]: (x: Alteration["target"]) => inParens(`add${x}`),
      [AlterOmit]: (x: Alteration["target"]) => inParens(`no${x}`),
      [AlterCompound]: (x: Alteration["target"]) => `${slash}${x}`,
      [AlterSuspend]: (x: Alteration["target"]) => `sus${x}`,
      [AlterEverything]: (x: Alteration["target"]) => `${sup(x)}alt`,

      // format alterations differently when they're part of a fractional display
      // (having a top and a bottom part)
      fractional: {
        [AlterRaise]: (x: Alteration["target"]) => `${uni("#")}${x}`,
        [AlterLower]: (x: Alteration["target"]) => `${uni("b")}${x}`,
        [AlterAdd]: (x: Alteration["target"]) => `add${x}`,
        [AlterOmit]: (x: Alteration["target"]) => `no${x}`,
        [AlterSuspend]: (x: Alteration["target"]) => `sus${x}`,
      },

      // should always display between parens, no matter how many
      alwaysParen: [
        AlterAdd,
        AlterOmit,
      ] as Alteration["kind"][],

      // should display between parens only if there are two or more total
      // alterations
      parenIfTwoOrMore: [
        AlterRaise,
        AlterLower,
        AlterSuspend,
      ] as Alteration["kind"][],
    },
  };

  override alterations() {
    const as = this.#chord.alterations;
    let [fractionable, rest] = partition(as, isFractionable);
    if (!this.shouldParen(fractionable)) return super.alterations(as);

    fractionable = sort(fractionable);

    const parenthesized = groupsOf(fractionable, 2).flatMap((group) => {
      let content = compact(group).map((a) => {
        const fn = this.symbols.alteration.fractional[a.kind];
        return `<span>${fn(a.target)}</span>`;
      }).join(parenJoiner);

      const klass = (compact(group).length > 1) ? "fractional" : "";
      content = `<span class="${klass}">${content}</span>`;

      return inParens(content);
    }).join("");

    const altersRest = super.alterations(rest);
    return `${altersRest}${parenthesized}`;
  }

  private shouldParen(as: Alteration[]): boolean {
    const always = as.filter((a) =>
      this.symbols.alteration.alwaysParen.indexOf(a.kind) >= 0
    );
    if (always.length > 0) return true;

    if (as.length < 2) return false;
    const ifTwoOrMore = as.filter((a) =>
      this.symbols.alteration.parenIfTwoOrMore.indexOf(a.kind) >= 0
    );
    return (ifTwoOrMore.length > 0);
  }
};

// unicode-ify the sharp or flat (returns a custom <span> element)
function uni(str: "#" | "b"): string {
  return `<span class="unicode-${str === "#" ? "sharp" : "flat"}">${
    str === "#" ? SharpSymbol : FlatSymbol
  }</span>`;
}

// wrap it in a <sup> (superscript) tag
function sup(s: number | string): string {
  return `<sup class="extent">${s}</sup>`;
}

// wrap it in a <sup> (superscript) tag
function dim(): string {
  return `<span class="dim-symbol">${sup("⚬")}</span>`;
}

// surround `str` with parens
function inParens(str: string): string {
  return `${parL}${str}${parR}`;
}

// so the DOM contains matched parens for every alteration we render
// (mostly for testing and to make sure the dom contains valid chord symbols)
const parenJoiner = `<span style="display: none;">)(</span>`;

type Fractionable =
  | Alteration & { kind: typeof AlterLower }
  | Alteration & { kind: typeof AlterRaise }
  | Alteration & { kind: typeof AlterAdd }
  | Alteration & { kind: typeof AlterOmit }
  | Alteration & { kind: typeof AlterSuspend };

const isFractionable = (a: Alteration): a is Fractionable => {
  return a.kind === AlterLower ||
    a.kind === AlterRaise ||
    a.kind === AlterAdd ||
    a.kind === AlterOmit ||
    a.kind === AlterSuspend;
};

const M = `<span class="small-caps">M</span>` as const;
const m = "m" as const;
const parL = `<span class="paren-open">(</span>`;
const parR = `<span class="paren-close">)</span>`;
const slash = `<span class="slash">/</span>` as const;
