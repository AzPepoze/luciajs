import { currentComponentCleanups } from "../dom/component/component.ts";
import { batch, untrack, watch } from "./graph.ts";
import type { Reactive } from "./reactive.ts";
import type { UpdateOptions } from "./variable.ts";

export function runsAtStart(options?: UpdateOptions): boolean {
  return options?.onInit ?? true;
}

/** Runs fn now, then again when a variable it read updates. Stops with the component, if inside one. */
export function autoRun(fn: () => void): () => void {
  const stop = watch(() => batch(fn));
  currentComponentCleanups()?.push(stop);
  return stop;
}

/** Runs fn only when one of the listed variables updates. fn's own reads are not tracked. */
export function watchVariables(
  variables: readonly Reactive[],
  fn: () => void,
  options?: UpdateOptions,
): () => void {
  let started = false;
  const stop = watch(() => {
    for (const variable of variables) variable.get();
    if (started || runsAtStart(options)) batch(() => untrack(fn));
    started = true;
  });
  currentComponentCleanups()?.push(stop);
  return stop;
}
