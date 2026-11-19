import type { ViewSettings } from "./view-options.ts";

export type ViewChange = (inView: boolean, stop: () => void) => void;

/** One IntersectionObserver for every element with the same rootMargin and threshold. */
class SharedObserver {
  private readonly targets = new Map<Element, Set<ViewChange>>();
  private readonly observer: IntersectionObserver;

  constructor(
    private readonly key: string,
    private readonly settings: ViewSettings,
  ) {
    this.observer = new IntersectionObserver((entries) => this.onEntries(entries), settings);
  }

  add(el: Element, onChange: ViewChange): void {
    let callbacks = this.targets.get(el);
    if (!callbacks) {
      callbacks = new Set();
      this.targets.set(el, callbacks);
      this.observer.observe(el);
    }
    callbacks.add(onChange);
  }

  remove(el: Element, onChange: ViewChange): void {
    const callbacks = this.targets.get(el);
    if (!callbacks || !callbacks.delete(onChange) || callbacks.size > 0) return;
    this.targets.delete(el);
    this.observer.unobserve(el);
    if (this.targets.size === 0) this.close();
  }

  private close(): void {
    this.observer.disconnect();
    observers.delete(this.key);
  }

  private onEntries(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      const callbacks = this.targets.get(entry.target);
      if (!callbacks) continue;
      const inView = entry.isIntersecting && entry.intersectionRatio >= this.settings.threshold;
      for (const onChange of [...callbacks]) {
        onChange(inView, () => this.remove(entry.target, onChange));
      }
    }
  }
}

const observers = new Map<string, SharedObserver>();

function observerFor(settings: ViewSettings): SharedObserver {
  const key = `${settings.rootMargin} ${settings.threshold}`;
  const found = observers.get(key);
  if (found) return found;
  const created = new SharedObserver(key, settings);
  observers.set(key, created);
  return created;
}

/** Calls onChange when el enters or leaves view. Returns the stop function. */
export function watchView(el: Element, settings: ViewSettings, onChange: ViewChange): () => void {
  const observer = observerFor(settings);
  observer.add(el, onChange);
  return () => observer.remove(el, onChange);
}
