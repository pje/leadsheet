import { partition } from "../../lib/array.ts";
import {
  type AlterableDegree,
  AlterAdd,
  type Alteration,
  AlterLower,
  AlterOmit,
  AlterRaise,
  AlterSuspend,
} from "../../theory/chord.ts";
import {
  Aug_id,
  Dim_id,
  Maj_id,
  Min_id,
} from "../../theory/chord/quality/triad.ts";
import { FlatSymbol, SharpSymbol } from "../../theory/notation.ts";
import { TextFormatter } from "./text_formatter.ts";

export const HTMLFormatter = class extends TextFormatter {
  override symbols = {
    ...(new TextFormatter()).symbols,
    "#": unicodeify("#"),
    "b": unicodeify("b"),
    quality: {
      ...(new TextFormatter()).symbols.quality,
      [Aug_id]: "⁺" as const,
      [Dim_id]: "°" as const,
      [Maj_id]: "" as const,
      [Min_id]: "m" as const,
    },
    alteration: {
      ...(new TextFormatter()).symbols.alteration,
      [AlterRaise]: (x: Alteration["target"]) => `${unicodeify("#")}${x}`,
      [AlterLower]: (x: Alteration["target"]) => `${unicodeify("b")}${x}`,
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

    const fractionalContent = parenable.map((a) => {
      const fn = this.symbols.alteration[a.kind];
      return `<span>${fn(a.target)}</span>`;
    });

    return [
      super.alterations(rest),
      `<span class="paren-open">(</span>`,
      `<span class="fractional">${fractionalContent.join("")}</span>`,
      `<span class="paren-close">)</span>`,
    ].join("");
  }
};

function unicodeify(str: "#" | "b"): string {
  return `<span class="unicode-${str === "#" ? "sharp" : "flat"}">${
    str === "#" ? SharpSymbol : FlatSymbol
  }</span>`;
}
