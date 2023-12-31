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
  type Chord,
  identify,
} from "../../theory/chord.ts";
import { Power_id } from "../../theory/chord/quality/dyad.ts";
import {
  Aug_id,
  Dim_id,
  Maj_id,
  Min_id,
} from "../../theory/chord/quality/triad.ts";
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
import { type ChordFormatter } from "../chord_formatter.ts";

export class TextFormatter implements ChordFormatter {
  #chord: Chord;

  constructor(c: Readonly<Chord>) {
    this.#chord = canonicalize(c);
  }

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
      [Maj6_id]: `6`,
      [Min6_id]: `m6`,
      [Maj69_id]: `6/9`,
      [Min69_id]: `m6/9`,
      [Maj6Sh5_id]: `+6`,
      [Power_id]: "5",
    },
    alteration: {
      [AlterRaise]: (x: Alteration["target"]) => `#${x}`,
      [AlterLower]: (x: Alteration["target"]) => `b${x}`,
      [AlterMajor]: (x: Alteration["target"]) => `M${x}`,
      [AlterMinor]: (x: Alteration["target"]) => `m${x}`,
      [AlterAdd]: (x: Alteration["target"]) => `(add${x})`,
      [AlterOmit]: (x: Alteration["target"]) => `(no${x})`,
      [AlterCompound]: (x: Alteration["target"]) => `/${x}`,
      [AlterSuspend]: (x: Alteration["target"]) => `sus${x}`,
      [AlterEverything]: (x: Alteration["target"]) => `alt${x}`,
    },
  };

  format(): string {
    return this.#format();
  }

  tonic() {
    const t = this.#chord.tonic;
    return t.replace("#", this.symbols["#"]).replace("b", this.symbols["b"]);
  }

  quality(): string {
    const qid = identify(this.#chord);
    const value = this.symbols.quality[qid];
    return typeof value === "function"
      ? value(this.#chord.quality.extent!)
      : value;
  }

  alterations(as: Array<Alteration>) {
    return as.map((a) => {
      const fn = this.symbols.alteration[a.kind];
      return fn(a.target);
    }).join("");
  }

  #format(): string {
    const t = this.tonic();
    const q = this.quality();
    const a = this.alterations(this.#chord.alterations);

    return `${t}${q}${a}`;
  }
}
