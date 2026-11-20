import type { ComputedVariable } from "./compute.ts";
import type { Variable } from "./variable.ts";

export const REACTIVE: unique symbol = Symbol("lucia.reactive");

export type Reactive = Variable<unknown> | ComputedVariable<unknown>;

export function isReactive(value: unknown): value is Reactive {
  return typeof value === "object" && value !== null && REACTIVE in value;
}

/** A variable or computed variable gives its current value; anything else is returned as is. */
export function unwrap(value: unknown): unknown {
  return isReactive(value) ? value.value : value;
}
