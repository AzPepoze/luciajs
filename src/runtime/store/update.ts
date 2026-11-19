import { currentComponentCleanups } from "../dom/component.ts";
import { batch, watch } from "./graph.ts";

/** Runs fn now, then again only when a store or read store it read changed. Stops with the component, if inside one. */
export function onUpdate(fn: () => void): () => void {
  const stop = watch(() => batch(fn));
  currentComponentCleanups()?.push(stop);
  return stop;
}
