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
  type Chord,
  identify,
  type Quality,
} from "../../theory/chord.ts";
import { type Letter } from "../../theory/letter.ts";
import { Power_id } from "../../theory/chord/quality/dyad.ts";
import {
  Aug_id,
  Dim_id,
  Maj_id,
  Min_id,
  type as TriadType,
} from "../../theory/chord/quality/triad.ts";
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
import { type ChordFormatter } from "../chord_formatter.ts";

export class TextFormatter implements ChordFormatter {
  symbols: ChordFormatter["symbols"] = {
    "#": "#",
    "b": "b",
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
      [AlterRaise]: (x: Alteration["target"]) => `#${x}`,
      [AlterLower]: (x: Alteration["target"]) => `b${x}`,
      [AlterMajor]: (x: Alteration["target"]) => `M${x}`,
      [AlterMinor]: (x: Alteration["target"]) => `m${x}`,
      [AlterAdd]: (x: Alteration["target"]) => `add${x}`,
      [AlterOmit]: (x: Alteration["target"]) => `no${x}`,
      [AlterCompound]: (x: Alteration["target"]) => `/${x}`,
      [AlterSuspend]: (x: Alteration["target"]) => `sus${x}`,
      [AlterEverything]: (x: Alteration["target"]) => `alt${x}`,
    },
  };

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
    return t.replace("#", this.symbols["#"]).replace("b", this.symbols["b"]);
  }
  quality(q: Readonly<Quality>): string {
    const key = identify(q);
    const value = this.symbols.quality[key];
    return typeof value === "function" ? value(q.extent!) : value;
  }
  alterations(as: Array<Alteration>) {
    return as.map((a) => {
      const fn = this.symbols.alteration[a.kind];
      const printed = fn(a.target);
      return a.kind === AlterAdd || a.kind === AlterOmit
        ? `(${printed})`
        : printed;
    }).join("");
  }

  #format(c: Readonly<Chord>): string {
    const t = this.tonic(c.tonic);
    const q = this.quality(c.quality);
    const a = this.alterations(c.alterations);

    return `${t}${q}${a}`;
  }
}

export const DefaultChordFormatterInstance = new TextFormatter();
