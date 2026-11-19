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

interface Source {
  observers: Set<Observer>;
}

interface Observer {
  sources: Set<Source>;
  /** Called synchronously when a source changes; must not read signals. */
  markDirty(): void;
}

let current: Observer | null = null;
let batchDepth = 0;
const queuedWatchers = new Set<() => void>();

function track(source: Source): void {
  if (!current) return;
  source.observers.add(current);
  current.sources.add(source);
}

function clearSources(observer: Observer): void {
  for (const source of observer.sources) source.observers.delete(observer);
  observer.sources.clear();
}

function withObserver<T>(observer: Observer | null, fn: () => T): T {
  const previous = current;
  current = observer;
  try {
    return fn();
  } finally {
    current = previous;
  }
}

function runQueuedWatchers(): void {
  for (const run of queuedWatchers) {
    queuedWatchers.delete(run);
    run();
  }
}

// Phase 1 marks the whole graph dirty; phase 2 runs watchers, so no one sees a half-updated graph.
function propagate(source: Source): void {
  for (const observer of source.observers) observer.markDirty();
  if (batchDepth === 0) runQueuedWatchers();
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

export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) runQueuedWatchers();
  }
}

export function untrack<T>(fn: () => T): T {
  return withObserver(null, fn);
}

export function watch(fn: () => void): () => void {
  let stopped = false;
  const run = (): void => {
    if (stopped) return;
    clearSources(observer);
    withObserver(observer, fn);
  };
  const observer: Observer = {
    sources: new Set(),
    markDirty: () => queuedWatchers.add(run),
  };
  run();
  return () => {
    stopped = true;
    queuedWatchers.delete(run);
    clearSources(observer);
  };
}
