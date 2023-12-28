import { partition } from "../../lib/array.ts";
import {
  type AlterableDegree,
  AlterAdd,
  type Alteration,
  AlterLower,
  AlterOmit,
  AlterRaise,
} from "../../theory/chord.ts";
import { FlatSymbol, SharpSymbol } from "../../theory/notation.ts";
import { TextFormatter } from "./text_formatter.ts";

export const HTMLFormatter = class extends TextFormatter {
  override symbols: TextFormatter["symbols"] = {
    ...(new TextFormatter()).symbols,
    "#": `<span class="unicode-flat">${SharpSymbol}</span>`,
    "b": `<span class="unicode-flat">${FlatSymbol}</span>`,
  };
  override alterations(as: Array<Alteration>) {
    if (as.length < 2) return super.alterations(as);

    const [parenable, rest] = partition(
      as,
      (a: Alteration) => {
        return a.kind === AlterLower ||
          a.kind === AlterRaise ||
          a.kind === AlterAdd ||
          a.kind === AlterOmit;
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
