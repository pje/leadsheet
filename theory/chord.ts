// @deno-types="../node_modules/ts-pattern/dist/index.d.ts"
import { match } from "../node_modules/ts-pattern/dist/index.js";
import { type Letter, transposeLetter } from "./letter.ts";
import { type FlatOrSharpSymbol } from "./notation.ts";
import {
  Add,
  Alteration,
  equals,
  isAdd6,
  isAdd9,
  isMaj7,
  isMin7,
  isSharp5,
  Lower,
  MakeMaj,
  MakeMin,
  No,
  Raise,
  rehydrate as rehydrateAlteration,
  uniq,
} from "./chord/alteration.ts";
import {
  identifyTriad,
  type Quality,
  QualityID,
  QualityIdToQuality,
} from "./chord/quality.ts";
import {
  Aug,
  Aug_id,
  Dim,
  Dim_id,
  Maj,
  Maj_id,
  Min,
  Min_id,
} from "./chord/quality/triad.ts";
import { compact, omit } from "../lib/object.ts";
import { Power, Power_id } from "./chord/quality/dyad.ts";
import {
  Aug7,
  Aug7_id,
  Dim7,
  Dim7_id,
  DimM7,
  DimM7_id,
  Dom7,
  Dom7_id,
  Maj6,
  Maj69,
  Maj69_id,
  Maj6_id,
  Maj6Sh5,
  Maj6Sh5_id,
  Maj7,
  Maj7_id,
  Maj7Sh5,
  Maj7Sh5_id,
  Min6,
  Min69,
  Min69_id,
  Min6_id,
  Min7,
  Min7_id,
  Min7Fl5,
  Min7Fl5_id,
  MinMaj7,
  MinMaj7_id,
} from "./chord/quality/tetrad.ts";
import { nonexhaustiveSwitchGuard } from "../lib/switch.ts";

export * from "./chord/alteration.ts";
export * from "./chord/extent.ts";
export * from "./chord/quality.ts";

export class Chord {
  public type = ChordTypeName;

  public tonic: Letter;
  public quality: Quality;
  public alterations: Array<Alteration>;

  constructor(
    tonic?: Letter,
    quality?: Quality,
    ...alterations: Array<Alteration>
  ) {
    this.tonic = tonic || "C";
    this.quality = quality || Maj;
    this.alterations = alterations;
  }

  // return a new Chord that's been transposed up (or down) by `halfSteps`.
  //
  // `flatsOrSharps` will be used to choose between equivalent enharmonic
  // spellings. (if `♭`, you'll get "Ab", not "G#")
  transpose(halfSteps: number, flatsOrSharps: FlatOrSharpSymbol): Chord {
    const chord = this.dup();
    const newRoot = transposeLetter(chord.tonic, halfSteps, flatsOrSharps);
    chord.tonic = newRoot;
    chord.alterations = this.alterations?.map((alt) =>
      alt.transpose(halfSteps, flatsOrSharps)
    );
    return chord;
  }

  // returns a new Chord, value-identical to this one
  dup(): Chord {
    return new Chord(
      this.tonic,
      this.quality,
      ...(this.alterations),
    );
  }
}

export const ChordTypeName = "chord" as const;

export function identify(chord: Readonly<Chord>): QualityID {
  const { quality } = chord;
  const result = match(quality)
    .returnType<QualityID>()
    .with(compact(Power), () => Power_id)
    .with(
      compact(Maj),
      () =>
        chord.alterations.some(isAdd6)
          ? chord.alterations.some(isAdd9) ? Maj69_id : Maj6_id
          : Maj_id,
    )
    .with(
      compact(Min),
      () =>
        chord.alterations.some((a) => equals(a, MakeMaj(7)))
          ? MinMaj7_id
          : chord.alterations.some(isAdd6)
          ? chord.alterations.some(isAdd9) ? Min69_id : Min6_id
          : Min_id,
    )
    .with(
      compact(Aug),
      () =>
        chord.alterations.some(isMin7)
          ? Aug7_id
          : chord.alterations.some(isMaj7)
          ? Maj7Sh5_id
          : Aug_id,
    )
    .with(
      compact(Dim),
      () => chord.alterations.some(isMaj7) ? DimM7_id : Dim_id,
    )
    .with(
      omit(Maj7, "extent"),
      () => chord.alterations.some(isSharp5) ? Maj7Sh5_id : Maj7_id,
    )
    .with(
      omit(Dom7, "extent"),
      () => chord.alterations.some(isSharp5) ? Aug7_id : Dom7_id,
    )
    .with(omit(MinMaj7, "extent"), () => MinMaj7_id)
    .with(omit(Min7, "extent"), () => Min7_id)
    .with(omit(Maj7Sh5, "extent"), () => Maj7Sh5_id)
    .with(omit(Min7Fl5, "extent"), () => Min7Fl5_id)
    .with(omit(Dim7, "extent"), () => Dim7_id)
    .with(omit(DimM7, "extent"), () => DimM7_id)
    .with(omit(Aug7, "extent"), () => Aug7_id)
    .with(omit(Maj69, "extent", "seventh"), () => Maj69_id)
    .with(omit(Min69, "extent", "seventh"), () => Min69_id)
    .with(omit(Maj6, "extent", "seventh"), () => Maj6_id)
    .with(omit(Min6, "extent", "seventh"), () => Min6_id)
    .with(Maj6Sh5, () => Maj6Sh5_id)
    .exhaustive();

  return result;
}

// This does a couple things:
// 1. Sort and de-dupe chord alterations:  "C(add3)(add3)" becomes "C(add3)"
// 2. Rephrase some complicated expressions using alterations into equivalent
// enumerated forms with no alterations.
// Goal is to reduce objectively equivalent phrasings to ones we have a
// specific identifier for. (Current goal is not to change all complicated
// phrasings to simpler ones.)
//
// Goal: reduce e.g. "C(add6)(add9)" to "C6/9"
// - we have an enum ID for `c6/9` — otherwise we'd classify this as just C
//
// Non-goal: reduce e.g. "Em/C" to "CM7"
// - they're integer-class-equivalent, but slash chords get an exemption
export function canonicalize(c: Readonly<Chord>): Chord {
  const qid = identify(c);
  const extent = c.quality.extent;
  const q: Quality = {
    ...QualityIdToQuality[qid],
    ...(extent ? { extent } : {}),
  } as Quality;

  const result = c.dup();
  result.quality = q;
  result.alterations = uniq(c.alterations);

  // just remove any redundant alterations from the triad.
  // assume that `identifyTriad` works—so at this point we can perfectly switch
  // on the chord's identity.
  const tid = identifyTriad(c.quality);
  switch (tid) {
    case Aug_id:
      deleteAlterations(result, Raise(5), MakeMaj(3));
      break;
    case Dim_id:
      deleteAlterations(result, Lower(5), MakeMin(3));
      break;
    case Maj_id:
      deleteAlterations(result, MakeMaj(5), MakeMaj(3));
      break;
    case Min_id:
      deleteAlterations(result, MakeMaj(5), MakeMin(3));
      break;
    case Power_id:
      deleteAlterations(result, MakeMaj(5), No(3));
      break;
    default:
      nonexhaustiveSwitchGuard(tid);
  }

  // just remove any redundant alterations from the 7th+
  // assume that `identify` works—so at this point we can perfectly switch on
  // the chord's identity.
  switch (qid) {
    case Dim_id:
    case Maj_id:
    case Min_id:
    case Aug_id:
    case Power_id:
      break;
    case Dom7_id:
      deleteAlterations(result, MakeMin(7));
      break;
    case Maj7_id:
      deleteAlterations(result, MakeMaj(7), Add(7));
      break;
    case Aug7_id:
      deleteAlterations(result, MakeMin(7), Raise(5));
      break;
    case Maj6_id:
    case Min6_id:
      deleteAlterations(result, Add(6));
      break;
    case Maj69_id:
    case Min69_id:
      deleteAlterations(result, Add(6), Add(9));
      break;
    case MinMaj7_id:
      deleteAlterations(result, MakeMaj(7), Add(7));
      break;
    case Min7_id:
      deleteAlterations(result, MakeMin(7));
      break;
    case Maj7Sh5_id:
      deleteAlterations(result, MakeMaj(7), Add(7), Raise(5));
      break;
    case Min7Fl5_id:
      deleteAlterations(result, MakeMin(7), Lower(5));
      break;
    case DimM7_id:
      deleteAlterations(result, MakeMaj(7), Add(7), Lower(5));
      break;
    case Maj6Sh5_id:
      deleteAlterations(result, Add(6), Raise(5));
      break;
    case Dim7_id:
      deleteAlterations(result, Lower(5));
      break;
    default:
      nonexhaustiveSwitchGuard(qid);
  }

  return result;
}

function deleteAlterations(c: Chord, ...as: Alteration[]) {
  for (const a of as) {
    const i = c.alterations.findIndex((a2) => equals(a, a2));
    if (i >= 0) c.alterations.splice(i, 1);
  }
}

export function rehydrate(c: Chord): Chord {
  const c2 = Object.assign(new Chord(c.tonic, c.quality, ...c.alterations), c);
  c2.alterations = c2.alterations.map(rehydrateAlteration);
  return c2;
}
