import type { ReadStore, Store } from "../store/store.ts";

const ATTACH: unique symbol = Symbol("ATTACH");
const DETACH: unique symbol = Symbol("DETACH");
const VIEW: unique symbol = Symbol("VIEW");
const HOVER: unique symbol = Symbol("HOVER");
const SCROLL: unique symbol = Symbol("SCROLL");
const MANUAL: unique symbol = Symbol("MANUAL");

export const WHEN = Object.freeze({ ATTACH, DETACH, VIEW, HOVER, SCROLL, MANUAL } as const);

export type When = (typeof WHEN)[keyof typeof WHEN];

/** A store or read store: truthy plays forward, falsy plays back. */
export type Source = Store<unknown> | ReadStore<unknown>;

const WHENS: ReadonlySet<unknown> = new Set<unknown>(Object.values(WHEN));

export function isWhen(value: unknown): value is When {
  return WHENS.has(value);
}
