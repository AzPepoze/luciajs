import type { Definition, HotInstance } from "./instance.ts";

// The latest definition per component file, and every mounted instance of each file.
const definitions = new Map<string, Definition>();
const live = new Map<string, Set<HotInstance>>();

export function definitionOf(id: string): Definition | undefined {
  return definitions.get(id);
}

export function setDefinition(id: string, definition: Definition): void {
  definitions.set(id, definition);
}

export function trackInstance(instance: HotInstance): void {
  let set = live.get(instance.id);
  if (!set) live.set(instance.id, (set = new Set()));
  set.add(instance);
}

export function untrackInstance(instance: HotInstance): void {
  live.get(instance.id)?.delete(instance);
}

/** A copy, so the caller can change the registry while it works through the list. */
export function liveInstances(id: string): HotInstance[] {
  return [...(live.get(id) ?? [])];
}
