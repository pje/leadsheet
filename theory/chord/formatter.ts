import { type Chord } from "../chord.ts";
import {
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
  type Kind,
} from "./alteration.ts";
import { Extent } from "./extent.ts";
import {
  Augmented,
  Diminished,
  Dominant,
  Major,
  Minor,
  MinorMajor,
  Power,
  type Quality,
  Suspended,
} from "./quality.ts";

import { Letter } from "../letter.ts";
import { FlatSymbol, SharpSymbol } from "../notation.ts";

export type ChordFormatter = {
  format: (c: Readonly<Chord>) => string;

  tonic: (t: Readonly<Letter>) => string;
  quality: (q: Readonly<Quality>) => string;
  extent: (e: Readonly<Extent>) => string;
  alterations: (as: Array<Alteration>) => string;

  symbols: {
    quality: {
      [K in Quality]: string;
    };
    extent: {
      [K in Extent]: string;
    };
    alteration: {
      [K in Kind]: string;
    };
  };
};

export class DefaultChordFormatter implements ChordFormatter {
  #format(c: Readonly<Chord>): string {
    return [
      this.tonic(c.tonic),
      this.quality(c.quality),
      this.extent(c.extent),
      this.alterations(c.alterations),
    ].join("");
  }

  format(c: Readonly<Chord>): string {
    switch (c.quality) {
      case Major: {
        let q = this.quality(c.quality);
        let e = this.extent(c.extent);
        const as = [...c.alterations];
        switch (c.extent) {
          case 6: {
            const i = as.findIndex((a) => a.isAdd9());
            if (i >= 0) {
              as.splice(i, 1);
              q = "6/9"; // we want "C6/9" instead of "C6(add 9)"
              e = "";
            } else {
              q = ""; // we want "C6" instead of "CM6"
            }
            break;
          }
          case undefined:
            q = ""; // we want "C" instead of "CM"
            break;
          default:
            q = "M"; // we want CM9
        }
        return [this.tonic(c.tonic), q, e, this.alterations(as)].join("");
      }
      default:
        return this.#format(c);
    }
  }

  tonic(t: Readonly<Letter>) {
    return `${t}`;
  }
  quality(q: Readonly<Quality>) {
    return this.symbols.quality[q];
  }
  extent(e: Readonly<Extent> | undefined) {
    return e ? `${e}` : "";
  }
  alterations(as: Array<Alteration>) {
    return as.map((a) =>
      (["add", "omit"].includes(a.kind)) ? `(${a.print()})` : a.print()
    ).join("");
  }

  symbols: ChordFormatter["symbols"] = {
    quality: {
      [Augmented]: "+" as const,
      [Diminished]: "o" as const,
      [Dominant]: "" as const,
      [Major]: "M" as const,
      [Minor]: "m" as const,
      [MinorMajor]: "mΔ" as const,
      [Power]: "5" as const,
      [Suspended]: "sus" as const,
    },
    extent: {
      2: "2",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      11: "11",
      13: "13",
    },
    alteration: {
      [AlterRaise]: SharpSymbol,
      [AlterLower]: FlatSymbol,
      [AlterMajor]: "M" as const,
      [AlterMinor]: "m" as const,
      [AlterAdd]: "add" as const,
      [AlterOmit]: "no " as const,
      [AlterCompound]: "/" as const,
      [AlterSuspend]: "sus" as const,
      [AlterEverything]: "alt" as const,
    },
  };
}

export const DefaultChordFormatterInstance = new DefaultChordFormatter();
