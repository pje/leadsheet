import { Extent } from "../theory/chord.ts";
import {
  type Alteration,
  AlterCompound,
  AlterEverything,
  AlterSuspend,
  type Kind,
} from "../theory/chord/alteration.ts";
import { type AlterableDegree } from "../theory/chord/extent.ts";
import { type QualityID } from "../theory/chord/quality.ts";
import { type ExtendableTetradID } from "../theory/chord/quality/tetrad.ts";
import { Letter } from "../theory/letter.ts";

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
      [K in Kind]: (
        e: K extends typeof AlterCompound ? Letter
          : K extends typeof AlterSuspend ? 2 | 4
          : K extends typeof AlterEverything ? Extent
          : AlterableDegree,
      ) => string;
    };
  };
};
