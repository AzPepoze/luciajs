import type { Component } from "../component/component.ts";

export type LazyLoad = () => Promise<{ default: Component }>;

/** Starts the import once. A failed import is cleared, so a later try starts it again. */
export function memoizeLoad(load: LazyLoad): () => Promise<Component> {
  let pending: Promise<Component> | undefined;
  return () => {
    pending ??= load().then(
      (module) => module.default,
      (error: unknown) => {
        pending = undefined;
        throw error;
      },
    );
    return pending;
  };
}

export function whenIdle(task: () => void): void {
  requestAnimationFrame(() =>
    setTimeout(() => {
      if (typeof requestIdleCallback === "function") requestIdleCallback(task);
      else task();
    }),
  );
}

export function whenNear(element: Element, task: () => void): () => void {
  if (typeof IntersectionObserver !== "function") {
    task();
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      task();
    },
    { rootMargin: "200px" },
  );
  observer.observe(element);
  return () => observer.disconnect();
}
