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
}

export function rehydrate(a: Alteration): Alteration {
  return Object.assign(new Alteration(a.kind, a.target), a);
}

export function isAdd6(a: Alteration) {
  return a.kind === AlterAdd && a.target === 6;
}

export function isAdd9(a: Alteration) {
  return a.kind === AlterAdd && a.target === 9;
}

export function equals(a1: Alteration, a2: Alteration): boolean {
  return a1.kind === a2.kind && a1.target === a2.target;
}

// sort by:
// -  `kind` (alphabetically ascending), then
// -  `target` (descending)
export function sort(as: Readonly<Alteration[]>): Alteration[] {
  return [...as].sort((a, b) => {
    const manualOrder = sortingOrder[a.kind] - sortingOrder[b.kind];
    if (manualOrder !== 0) return manualOrder;

    const kindCompare = a.kind.localeCompare(b.kind);
    if (kindCompare !== 0) return kindCompare;

    return (typeof b.target === "number" && typeof a.target === "number")
      ? b.target - a.target
      : `${b.target}`.localeCompare(`${a.target}`);
  });
}

// Returns a new array with all literally duplicate alterations removed
export function uniq(as: Readonly<Alteration[]>): Alteration[] {
  const result = sort(as);
  let prev: Alteration | undefined = undefined;

  return result.filter((a) => {
    const shouldKeep = !prev || !equals(a, prev);
    prev = a;
    return shouldKeep;
  });
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

// AoM7sus4#11b13(add2)(no5)/G
const sortingOrder: { [K in Kind]: number } = {
  [AlterMajor]: 0,
  [AlterMinor]: 0,
  [AlterSuspend]: 1,
  [AlterRaise]: 2,
  [AlterLower]: 2,
  [AlterAdd]: 3,
  [AlterOmit]: 3,
  [AlterCompound]: 4,
  [AlterEverything]: -1,
};

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
