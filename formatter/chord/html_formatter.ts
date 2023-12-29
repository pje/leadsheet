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
} from "../../theory/chord.ts";
import { Power_id } from "../../theory/chord/quality/dyad.ts";
import {
  Aug7_id,
  Dim7_id,
  DimM7_id,
  Dom7_id,
  Maj6_id,
  Maj6Sh5_id,
  Maj7_id,
  Maj7Sh5_id,
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

const M = "M" as const;
const m = "m" as const;

export const HTMLFormatter = class extends TextFormatter {
  override symbols = {
    ...(new TextFormatter()).symbols,
    "#": uni("#"),
    "b": uni("b"),
    quality: {
      ...(new TextFormatter()).symbols.quality,
      [Aug_id]: "⁺" as const,
      [Dim_id]: "°" as const,
      [Maj_id]: "" as const,
      [Min_id]: m,
      [Maj7_id]: (x: AlterableDegree) => `${M}${sup(x)}`,
      [Dom7_id]: (x: AlterableDegree) => `${sup(x)}`,
      [Min7_id]: (x: AlterableDegree) => `${m}${sup(x)}`,
      [Aug7_id]: (x: AlterableDegree) => `⁺${sup(x)}`,
      [Dim7_id]: (x: AlterableDegree) => `°${sup(x)}`,
      [DimM7_id]: (x: AlterableDegree) => `°${sup(M)}${sup(x)}`,
      [Maj7Sh5_id]: (x: AlterableDegree) => `⁺${sup(M)}${sup(x)}`,
      [Min7Fl5_id]: (x: AlterableDegree) => `${m}${sup(x)}${uni("b")}${sup(5)}`,
      [MinMaj7_id]: (x: AlterableDegree) => `${m}${sup(M)}${sup(x)}`,
      [Maj6_id]: sup(6),
      [Min6_id]: `${m}${sup(6)}`,
      [Maj6Sh5_id]: `⁺${sup(6)}`,
      [Power_id]: sup(5),
    },
    alteration: {
      ...(new TextFormatter()).symbols.alteration,
      [AlterRaise]: (x: Alteration["target"]) => `${uni("#")}${x}`,
      [AlterLower]: (x: Alteration["target"]) => `${uni("b")}${x}`,
      [AlterMajor]: (x: Alteration["target"]) => `${sup(M)}${sup(x)}`,
      [AlterMinor]: (x: Alteration["target"]) => `${sup(m)}${sup(x)}`,
      [AlterAdd]: (x: Alteration["target"]) => `${low("add")}${x}`,
      [AlterOmit]: (x: Alteration["target"]) => `${low("no")}${x}`,
      [AlterCompound]: (x: Alteration["target"]) => `${slash}${x}`,
      [AlterSuspend]: (x: Alteration["target"]) => `${low("sus")}${x}`,
      [AlterEverything]: (x: Alteration["target"]) => `${sup(x)}${low("alt")}`,
    },
  };

  override alterations(as: Array<Alteration>) {
    if (as.length < 2) return super.alterations(as);

    const [parenable, rest] = partition(
      as,
      (a: Alteration) => {
        return a.kind === AlterLower ||
          a.kind === AlterRaise ||
          a.kind === AlterAdd ||
          a.kind === AlterOmit ||
          a.kind === AlterSuspend;
      },
    );

    if (parenable.length < 2) return super.alterations(as);

    parenable.sort((a, b) =>
      <AlterableDegree> b.target - <AlterableDegree> a.target
    );

    return groupsOf(parenable, 2).flatMap((group) => {
      const fractionalContent = compact(group).map((a) => {
        const fn = this.symbols.alteration[a.kind];
        return `<span>${fn(a.target)}</span>`;
      });

      return [
        super.alterations(rest),
        `<span class="paren-open">(</span>`,
        `<span class="fractional">${fractionalContent.join("")}</span>`,
        `<span class="paren-close">)</span>`,
      ].join("");
    }).join("");
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

// make the text slightly smaller
function low(s: string): string {
  return `<span class="deemphasize">${s}</span>`;
}

const slash = `<span class="slash">/</span>` as const;
