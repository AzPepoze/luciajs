import type { ViewSettings } from "../options/view-options.ts";

export type ViewChange = (inView: boolean, stop: () => void) => void;

// A 1% step is finer than any amount needs. Each step is a callback per observed element.
const STEPS = 100;
const STEP_RATIOS = Array.from({ length: STEPS + 1 }, (_, i) => i / STEPS);

/** One IntersectionObserver for every element with the same rootMargin and amount. */
class SharedObserver {
  private readonly targets = new Map<Element, Set<ViewChange>>();
  private readonly observer: IntersectionObserver;

  constructor(
    private readonly key: string,
    private readonly settings: ViewSettings,
  ) {
    this.observer = new IntersectionObserver((entries) => this.onEntries(entries), {
      rootMargin: settings.rootMargin,
      threshold: STEP_RATIOS,
    });
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
      const inView = entry.isIntersecting && visibleShare(entry) >= this.settings.amount;
      for (const onChange of [...callbacks]) {
        onChange(inView, () => this.remove(entry.target, onChange));
      }
    }
  }
}

const observers = new Map<string, SharedObserver>();

function observerFor(settings: ViewSettings): SharedObserver {
  const key = `${settings.rootMargin} ${settings.amount}`;
  const found = observers.get(key);
  if (found) return found;
  const created = new SharedObserver(key, settings);
  observers.set(key, created);
  return created;
}

export function watchView(el: Element, settings: ViewSettings, onChange: ViewChange): () => void {
  let inside: boolean | undefined;
  const onState: ViewChange = (inView, stop) => {
    if (inView === inside) return;
    inside = inView;
    onChange(inView, stop);
  };
  const observer = observerFor(settings);
  observer.add(el, onState);
  return () => observer.remove(el, onState);
}

// A tall element counts against the screen, so it can reach the full share.
function visibleShare(entry: IntersectionObserverEntry): number {
  const root = entry.rootBounds;
  if (!root) return entry.intersectionRatio;
  const target = entry.boundingClientRect;
  const reach = Math.min(target.width, root.width) * Math.min(target.height, root.height);
  if (reach === 0) return entry.intersectionRatio;
  const visible = entry.intersectionRect;
  return (visible.width * visible.height) / reach;
}
