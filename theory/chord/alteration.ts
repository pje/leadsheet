import { nonexhaustiveSwitchGuard } from "../../lib/switch.ts";
import { Letter, transposeLetter } from "../letter.ts";
import { FlatOrSharpSymbol } from "../notation.ts";

type Extent = 2 | 3 | 4 | 5 | 6 | 7 | 9 | 11 | 13;

export class Alteration {
  public kind: Kind;
  public target: Letter | Extent;

  constructor(kind: Kind, target: Letter | Extent) {
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
        return `(add${target})`;
      case "omit":
        return `(no${target})`;
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
