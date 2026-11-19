export interface Source {
  observers: Set<Observer>;
}

export interface Observer {
  sources: Set<Source>;
  /** Called synchronously when a source changes; must not read signals. */
  markDirty(): void;
}

let current: Observer | null = null;
let batchDepth = 0;
const queuedWatchers = new Set<() => void>();

export function track(source: Source): void {
  if (!current) return;
  source.observers.add(current);
  current.sources.add(source);
}

export function clearSources(observer: Observer): void {
  for (const source of observer.sources) source.observers.delete(observer);
  observer.sources.clear();
}

export function withObserver<T>(observer: Observer | null, fn: () => T): T {
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
export function propagate(source: Source): void {
  for (const observer of source.observers) observer.markDirty();
  if (batchDepth === 0) runQueuedWatchers();
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
