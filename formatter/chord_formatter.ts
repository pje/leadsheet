import { type Chord } from "../theory/chord.ts";
import { type Alteration, type Kind } from "../theory/chord/alteration.ts";
import { type AlterableDegree } from "../theory/chord/extent.ts";
import { type Quality, type QualityID } from "../theory/chord/quality.ts";
import { type Letter } from "../theory/letter.ts";
import { type ExtendableTetradID } from "../theory/chord/quality/tetrad.ts";

export type ChordFormatter = {
  format: (c: Readonly<Chord>) => string;

  tonic: (t: Readonly<Letter>) => string;
  quality: (q: Quality) => string;
  alterations: (as: Array<Alteration>) => string;

  symbols: {
    "#": string;
    "b": string;
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
