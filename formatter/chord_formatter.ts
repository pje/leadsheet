import { type Alteration, type Kind } from "../theory/chord/alteration.ts";
import { type AlterableDegree } from "../theory/chord/extent.ts";
import { type QualityID } from "../theory/chord/quality.ts";
import { type ExtendableTetradID } from "../theory/chord/quality/tetrad.ts";

export type ChordFormatter = {
  format: () => string;

  tonic: () => string;
  quality: () => string;
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
      [K in Kind]: (e: Alteration["target"]) => string;
    };
  };
};
