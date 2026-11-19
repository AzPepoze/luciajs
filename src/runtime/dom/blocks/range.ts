import type { Cleanup } from "../bindings.ts";
import type { Leave } from "../leave.ts";
import { bindEach, type RowRender } from "./each.ts";

export interface Bounds {
  from: number;
  /** Exclusive. */
  to: number;
  step: number;
}

export function rangeOf({ from, to, step }: Bounds): number[] {
  if (step === 0) throw new Error("FOR needs a step that is not 0");
  const values: number[] = [];
  for (let value = from; step > 0 ? value < to : value > to; value += step) values.push(value);
  return values;
}

/** `FOR {i} from to step`: an EACH over the range, keyed by its values. */
export function bindFor(marker: Comment, read: () => Bounds, render: RowRender, cleanups: Cleanup[], leaves: Leave[]): void {
  bindEach(marker, { read: () => rangeOf(read()), render, indexed: false }, cleanups, leaves);
}
