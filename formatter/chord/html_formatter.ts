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
import { FlatSymbol, SharpSymbol } from "../../theory/notation.ts";
import { TextFormatter } from "./text_formatter.ts";

export const HTMLFormatter = class extends TextFormatter {
  override symbols: TextFormatter["symbols"] = {
    ...(new TextFormatter()).symbols,
    "#": unicodeify("#"),
    "b": unicodeify("b"),
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

function unicodeify(str: "#" | "b"): string {
  return `<span class="unicode-${str === "#" ? "sharp" : "flat"}">${
    str === "#" ? SharpSymbol : FlatSymbol
  }</span>`;
}
