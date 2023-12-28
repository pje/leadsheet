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
      case AlterCompound:
        return new Alteration(
          kind,
          transposeLetter(<Letter> target, halfSteps, flatsOrSharps),
        );
      default:
        return this;
    }
  }

  dup(): Alteration {
    return new Alteration(this.kind, this.target);
  }

  print(): string {
    const { kind, target } = this;
    switch (kind) {
      case AlterRaise:
        return `#${target}`;
      case AlterLower:
        return `b${target}`;
      case AlterMajor:
        return `M${target}`;
      case AlterMinor:
        return `m${target}`;
      case AlterAdd:
        return `add${target}`;
      case AlterOmit:
        return `no${target}`;
      case AlterCompound:
        return `/${target}`;
      case AlterSuspend:
        return `sus${target}`;
      case AlterEverything:
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

export function rehydrate(a: Alteration): Alteration {
  return Object.assign(new Alteration(a.kind, a.target), a);
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
export const Sus = (a: 2 | 4) => new Alteration(AlterSuspend, a);
export const Sus2 = Sus(2);
export const Sus4 = Sus(4);
export const Over = (l: Letter) => new Alteration(AlterCompound, l);
export const Raise = (e: AlterableDegree) => new Alteration(AlterRaise, e);
export const Lower = (e: AlterableDegree) => new Alteration(AlterLower, e);
export const Add = (e: AlterableDegree) => new Alteration(AlterAdd, e);
export const Add6 = Add(6);
export const Add9 = Add(9);
export const No = (e: AlterableDegree) => new Alteration(AlterOmit, e);
export const Everything = (e: AlterableDegree) =>
  new Alteration(AlterEverything, e);
