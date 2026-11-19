import { STYLE, type EaseStyle } from "./easing.ts";

/** Shapes an easing style for one segment: t in 0..1 of the segment goes in, the eased progress comes out. */
export type Ease = (style: EaseStyle, t: number) => number;

const IN: Ease = (style, t) => style(t);
const OUT: Ease = (style, t) => 1 - style(1 - t);
const INOUT: Ease = (style, t) => (t < 0.5 ? style(2 * t) / 2 : 1 - style(2 - 2 * t) / 2);

/** STYLE holds the easing styles. IN, OUT and INOUT set the direction a style plays. */
export const EASE = Object.freeze({ STYLE, IN, OUT, INOUT } as const);

const DIRECTIONS: ReadonlySet<unknown> = new Set<unknown>([IN, OUT, INOUT]);

export function isEase(value: unknown): value is Ease {
  return DIRECTIONS.has(value);
}
