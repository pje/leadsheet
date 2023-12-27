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
import { AlterableDegree } from "./extent.ts";
import { identify, type Quality, QualityID } from "./quality.ts";
import { Letter } from "../letter.ts";
import { FlatSymbol, SharpSymbol } from "../notation.ts";
import { Power_id } from "./quality/dyad.ts";
import {
  Aug_id,
  Dim_id,
  Maj_id,
  Min_id,
  type as TriadType,
} from "./quality/triad.ts";
import {
  Aug7_id,
  Dim7_id,
  DimM7_id,
  Dom7_id,
  ExtendableTetradID,
  Maj6_id,
  Maj6Sh5_id,
  Maj7_id,
  Maj7Sh5_id,
  Min6_id,
  Min7_id,
  Min7Fl5_id,
  MinMaj7_id,
} from "./quality/tetrad.ts";

export type ChordFormatter = {
  format: (c: Readonly<Chord>) => string;

  tonic: (t: Readonly<Letter>) => string;
  quality: (q: Quality) => string;
  alterations: (as: Array<Alteration>) => string;

  symbols: {
    quality: {
      [K in QualityID]: K extends ExtendableTetradID
        ? (e: AlterableDegree) => string
        : string;
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
      this.alterations(c.alterations),
    ].join("");
  }

  format(c: Readonly<Chord>): string {
    if (c.quality.type === TriadType) {
      let q = this.quality(c.quality);
      const as = [...c.alterations];
      const s_i = as.findIndex((a) => a.isAdd6());
      if (s_i >= 0) {
        as.splice(s_i, 1);
        q += "6"; // we want "C6" or "Cm6"
        const n_i = as.findIndex((a) => a.isAdd9());
        if (n_i >= 0) {
          as.splice(n_i, 1);
          q += "/9"; // we want "C6/9" instead of "C6(add 9)"
        }
      }
      return [this.tonic(c.tonic), q, this.alterations(as)].join("");
    }

    return this.#format(c);
  }

  tonic(t: Readonly<Letter>) {
    return `${t}`;
  }
  quality(q: Readonly<Quality>): string {
    const key = identify(q);
    const value = this.symbols.quality[key];
    return typeof value === "function" ? value(q.extent!) : value;
  }
  alterations(as: Array<Alteration>) {
    return as.map((a) =>
      (["add", "omit"].includes(a.kind)) ? `(${a.print()})` : a.print()
    ).join("");
  }

  symbols: ChordFormatter["symbols"] = {
    quality: {
      [Aug_id]: "+",
      [Dim_id]: "o",
      [Maj_id]: "",
      [Min_id]: "m",
      [Maj7_id]: (x: AlterableDegree) => `M${x}`,
      [Dom7_id]: (x: AlterableDegree) => `${x}`,
      [Min7_id]: (x: AlterableDegree) => `m${x}`,
      [Aug7_id]: (x: AlterableDegree) => `+${x}`,
      [Dim7_id]: (x: AlterableDegree) => `o${x}`,
      [DimM7_id]: (x: AlterableDegree) => `oM${x}`,
      [Maj7Sh5_id]: (x: AlterableDegree) => `+M${x}`,
      [Min7Fl5_id]: (x: AlterableDegree) => `m${x}b5`,
      [MinMaj7_id]: (x: AlterableDegree) => `mM${x}`,
      [Maj6_id]: `M6`,
      [Min6_id]: `m6`,
      [Maj6Sh5_id]: `+6`,
      [Power_id]: "5",
    },
    alteration: {
      [AlterRaise]: SharpSymbol,
      [AlterLower]: FlatSymbol,
      [AlterMajor]: "M" as const,
      [AlterMinor]: "m" as const,
      [AlterAdd]: "add" as const,
      [AlterOmit]: "no" as const,
      [AlterCompound]: "/" as const,
      [AlterSuspend]: "sus" as const,
      [AlterEverything]: "alt" as const,
    },
  };
}

export const DefaultChordFormatterInstance = new DefaultChordFormatter();
