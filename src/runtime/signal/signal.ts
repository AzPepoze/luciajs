import { batch, clearSources, propagate, track, withObserver, type Observer, type Source } from "./graph.ts";

const REACTIVE: unique symbol = Symbol("lucia.reactive");

export interface Signal<T> {
  value: T;
  peek(): T;
  readonly [REACTIVE]: true;
}

export interface Computed<T> {
  readonly value: T;
  peek(): T;
  readonly [REACTIVE]: true;
}

export function signal<T>(initial: T): Signal<T> {
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

export function computed<T>(fn: () => T): Computed<T> {
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

export function isReactive(value: unknown): value is Signal<unknown> | Computed<unknown> {
  return typeof value === "object" && value !== null && REACTIVE in value;
}

/** A signal or computed gives its current value; anything else is returned as is. */
export function unwrap(value: unknown): unknown {
  return isReactive(value) ? value.value : value;
}
