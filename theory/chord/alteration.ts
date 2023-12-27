import { nonexhaustiveSwitchGuard } from "../../lib/switch.ts";
import { Letter, transposeLetter } from "../letter.ts";
import { FlatOrSharpSymbol } from "../notation.ts";
import { AlterableDegree } from "./extent.ts";

export class Alteration {
  public kind: Kind;
  public target: Letter | AlterableDegree;

  constructor(kind: Kind, target: Letter | AlterableDegree) {
    this.kind = kind;
    this.target = target;
  }

  transpose(halfSteps: number, flatsOrSharps: FlatOrSharpSymbol) {
    const { kind, target } = this;
    switch (kind) {
      case "compound":
        return new Alteration(
          kind,
          transposeLetter(<Letter> target, halfSteps, flatsOrSharps),
        );
      default:
        return this;
    }
  }

  public print(): string {
    const { kind, target } = this;
    switch (kind) {
      case "raise":
        return `#${target}`;
      case "lower":
        return `b${target}`;
      case "major":
        return `M${target}`;
      case "minor":
        return `m${target}`;
      case "add":
        return `add${target}`;
      case "omit":
        return `no${target}`;
      case "compound":
        return `/${target}`;
      case "suspend":
        return `sus${target}`;
      case "everything":
        return `alt${target}`;
      default:
        nonexhaustiveSwitchGuard(kind);
    }
  }

  public isAdd6() {
    return this.kind === AlterAdd && this.target === 6;
  }
  public isAdd9() {
    return this.kind === AlterAdd && this.target === 9;
  }
}

export type Kind =
  | typeof AlterRaise
  | typeof AlterLower
  | typeof AlterMajor
  | typeof AlterMinor
  | typeof AlterAdd
  | typeof AlterOmit
  | typeof AlterCompound
  | typeof AlterSuspend
  | typeof AlterEverything;

export const AlterRaise = "raise" as const;
export const AlterLower = "lower" as const;
export const AlterMajor = "major" as const;
export const AlterMinor = "minor" as const;
export const AlterAdd = "add" as const;
export const AlterOmit = "omit" as const;
export const AlterCompound = "compound" as const;
export const AlterSuspend = "suspend" as const;
export const AlterEverything = "everything" as const;

// convenience instances
export const Add6 = new Alteration("add", 6);
export const Add9 = new Alteration("add", 9);
export const Sus = (a: 2 | 4) => new Alteration("suspend", a);
export const Sus2 = new Alteration("suspend", 2);
export const Sus4 = new Alteration("suspend", 4);
export const Over = (l: Letter) => new Alteration("compound", l);
export const Raise = (e: AlterableDegree) => new Alteration("raise", e);
export const Lower = (e: AlterableDegree) => new Alteration("lower", e);
export const Add = (e: AlterableDegree) => new Alteration("add", e);
export const No = (e: AlterableDegree) => new Alteration("omit", e);
export const Everything = (e: AlterableDegree) =>
  new Alteration("everything", e);
