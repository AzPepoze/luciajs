import { currentComponentCleanups } from "../dom/component/component.ts";
import { compute } from "./compute.ts";
import { batch, propagate, queueWatcher, track, untrack, type Source } from "./graph.ts";
import { REACTIVE } from "./reactive.ts";
import { autoRun, runsAtStart, watchVariables } from "./update.ts";

export interface UpdateOptions {
  /** Run once right away, with `before` undefined. Default true. */
  onInit?: boolean;
}

export interface Variable<T> {
  value: T;
  get(): T;
  set(next: T): void;
  peek(): T;
  onUpdate(fn: (now: T, before: T | undefined) => void, options?: UpdateOptions): () => void;
  readonly [REACTIVE]: true;
}

type Listener<T> = (now: T, before: T | undefined) => void;

function createVariable<T>(initial: T): Variable<T> {
  let value = initial;
  const source: Source = { observers: new Set() };
  const listeners = new Set<Listener<T>>();

  function read(): T {
    track(source);
    return value;
  }

  function write(next: T): void {
    if (Object.is(next, value)) return;
    const before = value;
    value = next;
    batch(() => {
      propagate(source);
      for (const listener of listeners) queueWatcher(() => notify(listener, next, before));
    });
  }

  function notify(listener: Listener<T>, next: T, before: T): void {
    if (listeners.has(listener)) batch(() => untrack(() => listener(next, before)));
  }

  function listen(fn: Listener<T>, options?: UpdateOptions): () => void {
    const listener: Listener<T> = (now, before) => fn(now, before);
    if (runsAtStart(options)) batch(() => untrack(() => fn(value, undefined)));
    listeners.add(listener);
    const stop = (): void => {
      listeners.delete(listener);
    };
    currentComponentCleanups()?.push(stop);
    return stop;
  }

  return {
    get value() {
      return read();
    },
    set value(next: T) {
      write(next);
    },
    get: read,
    set: write,
    peek: () => value,
    onUpdate: listen,
    [REACTIVE]: true,
  };
}

/** `variable(value)` makes a variable. `variable.compute(fn)` derives a computed one. `variable.autoRun(fn)` runs fn now and on each update it reads. */
export const variable = Object.assign(createVariable, {
  compute,
  autoRun,
  watch: watchVariables,
});
