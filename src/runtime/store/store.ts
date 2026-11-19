import { batch, clearSources, propagate, track, withObserver, type Observer, type Source } from "./graph.ts";
import { onUpdate } from "./update.ts";

const REACTIVE: unique symbol = Symbol("lucia.reactive");

export interface Store<T> {
  value: T;
  peek(): T;
  readonly [REACTIVE]: true;
}

export interface ReadStore<T> {
  readonly value: T;
  peek(): T;
  readonly [REACTIVE]: true;
}

function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const source: Source = { observers: new Set() };
  return {
    get value() {
      track(source);
      return value;
    },
    set value(next: T) {
      if (Object.is(next, value)) return;
      value = next;
      batch(() => propagate(source));
    },
    peek: () => value,
    [REACTIVE]: true,
  };
}

function storeFrom<T>(fn: () => T): ReadStore<T> {
  let value: T;
  let dirty = true;
  const node: Source & Observer = {
    observers: new Set(),
    sources: new Set(),
    markDirty() {
      if (dirty) return;
      dirty = true;
      propagate(node);
    },
  };
  const read = (): T => {
    if (dirty) {
      clearSources(node);
      value = withObserver(node, fn);
      dirty = false;
    }
    return value;
  };
  return {
    get value() {
      track(node);
      return read();
    },
    peek: read,
    [REACTIVE]: true,
  };
}

/** `store(value)` makes a writable store. `store.from(fn)` derives a read-only store. `store.onUpdate(fn)` runs fn on change. */
export const store = Object.assign(createStore, { from: storeFrom, onUpdate });

export function isReactive(value: unknown): value is Store<unknown> | ReadStore<unknown> {
  return typeof value === "object" && value !== null && REACTIVE in value;
}

/** A store or read store gives its current value; anything else is returned as is. */
export function unwrap(value: unknown): unknown {
  return isReactive(value) ? value.value : value;
}
