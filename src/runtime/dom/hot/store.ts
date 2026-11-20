import type { Store } from "../../store/store.ts";
import { currentFrame } from "./render.ts";

/**
 * Dev builds wrap each top-level `store(...)` in this. The store takes the value it had before the
 * last hot swap, found by variable name. A name that is new starts from its initial value.
 */
export function hotStore<T>(name: string, created: Store<T>): Store<T> {
  const frame = currentFrame();
  if (!frame) return created;
  frame.stores.set(name, created as Store<unknown>);
  const restore = frame.instance.restore;
  if (restore?.has(name) && isWritable(created)) created.value = restore.get(name) as T;
  return created;
}

function isWritable(store: object): boolean {
  return Object.getOwnPropertyDescriptor(store, "value")?.set !== undefined;
}
