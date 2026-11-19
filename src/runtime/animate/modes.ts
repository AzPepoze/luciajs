import type { Transition } from "./easing.ts";

/** Turns a transition curve into the segment's curve, for progress t in 0..1 of the segment. */
export type Ease = (transition: Transition, t: number) => number;

const IN: Ease = (transition, t) => transition(t);
const OUT: Ease = (transition, t) => 1 - transition(1 - t);
const INOUT: Ease = (transition, t) => (t < 0.5 ? transition(2 * t) / 2 : 1 - transition(2 - 2 * t) / 2);

export const EASE = Object.freeze({ IN, OUT, INOUT } as const);

const EASES: ReadonlySet<unknown> = new Set<unknown>(Object.values(EASE));

export function isEase(value: unknown): value is Ease {
  return EASES.has(value);
}
