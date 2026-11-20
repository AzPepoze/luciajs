import { runtimeError } from "../errors.ts";
import {
  clearSources,
  propagate,
  track,
  withObserver,
  type Observer,
  type Source,
} from "./graph.ts";
import { REACTIVE } from "./reactive.ts";

export interface ComputedVariable<T> {
  readonly value: T;
  get(): T;
  peek(): T;
  readonly [REACTIVE]: true;
}

function rejectSet(): never {
  throw runtimeError("L2053");
}

/** Cached until a variable it reads updates. It has no set: write to the variables it reads. */
export function compute<T>(fn: () => T): ComputedVariable<T> {
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
  const readTracked = (): T => {
    track(node);
    return read();
  };
  const computed = {
    get value() {
      return readTracked();
    },
    get: readTracked,
    peek: read,
    set: rejectSet,
    [REACTIVE]: true as const,
  };
  return computed;
}
