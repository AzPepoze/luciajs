import type { ReadStore, Store } from "../store/store.ts";

const IN: unique symbol = Symbol("IN");
const OUT: unique symbol = Symbol("OUT");
const VIEW: unique symbol = Symbol("VIEW");
const HOVER: unique symbol = Symbol("HOVER");
const SCROLL: unique symbol = Symbol("SCROLL");
const MANUAL: unique symbol = Symbol("MANUAL");

export const ACTIVE = Object.freeze({ IN, OUT, VIEW, HOVER, SCROLL, MANUAL } as const);

export type Active = (typeof ACTIVE)[keyof typeof ACTIVE];

/** A store or read store: truthy plays forward, falsy plays back. */
export type Source = Store<unknown> | ReadStore<unknown>;

const ACTIVES: ReadonlySet<unknown> = new Set<unknown>(Object.values(ACTIVE));

export function isActive(value: unknown): value is Active {
  return ACTIVES.has(value);
}
