import type { ComputedVariable } from "../../variable/compute.ts";
import type { Variable } from "../../variable/variable.ts";

const ATTACH: unique symbol = Symbol("ATTACH");
const DETACH: unique symbol = Symbol("DETACH");
const VIEW: unique symbol = Symbol("VIEW");
const HOVER: unique symbol = Symbol("HOVER");
const SCROLL: unique symbol = Symbol("SCROLL");
const MOVE: unique symbol = Symbol("MOVE");
const RESIZE: unique symbol = Symbol("RESIZE");
const MOVE_OR_RESIZE: unique symbol = Symbol("MOVE_OR_RESIZE");
const MANUAL: unique symbol = Symbol("MANUAL");

export const WHEN = Object.freeze({
  ATTACH,
  DETACH,
  VIEW,
  HOVER,
  SCROLL,
  MOVE,
  RESIZE,
  MOVE_OR_RESIZE,
  MANUAL,
} as const);

export type When = (typeof WHEN)[keyof typeof WHEN];

/** The triggers that glide the element when its layout box changes. */
export type LayoutWhen = typeof WHEN.MOVE | typeof WHEN.RESIZE | typeof WHEN.MOVE_OR_RESIZE;

/** A variable or computed variable: truthy plays forward, falsy plays back. */
export type Source = Variable<unknown> | ComputedVariable<unknown>;

const WHENS: ReadonlySet<unknown> = new Set<unknown>(Object.values(WHEN));

export function isWhen(value: unknown): value is When {
  return WHENS.has(value);
}

const LAYOUT_WHENS: ReadonlySet<unknown> = new Set<unknown>([
  WHEN.MOVE,
  WHEN.RESIZE,
  WHEN.MOVE_OR_RESIZE,
]);

export function isLayoutWhen(value: unknown): value is LayoutWhen {
  return LAYOUT_WHENS.has(value);
}
