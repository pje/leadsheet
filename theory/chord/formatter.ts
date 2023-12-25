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
import {
  Aug6,
  Aug7ID,
  AugID,
  Dim7ID,
  DimID,
  DimM7ID,
  Dom7ID,
  DyadID,
  ExtendableTetradID,
  Maj6,
  Maj7ID,
  Maj7S5ID,
  MajID,
  Min6,
  Min7ID,
  MinID,
  MinMaj7ID,
  MinXb5ID,
  PowerID,
  type Quality,
  QualityID,
  TertianTriadID,
  TetradID,
} from "./quality.ts";

import { Letter } from "../letter.ts";
import { FlatSymbol, SharpSymbol } from "../notation.ts";

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
    if (
      !c.quality.tetrad &&
      (c.quality.triad === MajID || c.quality.triad === MinID)
    ) {
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
    const key = q.tetrad
      ? <TetradID> `${q.triad}${q.tetrad}`
      : q.triad
      ? <TertianTriadID> q.triad
      : <DyadID> (q.dyad!);

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
      [AugID]: "+",
      [DimID]: "o",
      [MajID]: "",
      [MinID]: "m",
      [Dom7ID]: (x: AlterableDegree) => `${x}`,
      [Maj7ID]: (x: AlterableDegree) => `M${x}`,
      [Min7ID]: (x: AlterableDegree) => `m${x}`,
      [Aug7ID]: (x: AlterableDegree) => `+${x}`,
      [Dim7ID]: (x: AlterableDegree) => `o${x}`,
      [DimM7ID]: (x: AlterableDegree) => `oM${x}`,
      [Maj7S5ID]: (x: AlterableDegree) => `+M${x}`,
      [MinXb5ID]: (x: AlterableDegree) => `m${x}b5`,
      [MinMaj7ID]: (x: AlterableDegree) => `mM${x}`,
      [Maj6]: `M6`,
      [Min6]: `m6`,
      [Aug6]: `+6`,
      [PowerID]: "5",
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
