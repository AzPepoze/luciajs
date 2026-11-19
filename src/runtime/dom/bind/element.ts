import type { Cleanup } from "../bindings.ts";
import { assertWritable } from "./channel.ts";

/** `bind-element={ref}`: the store holds the element while it is attached. */
export function bindElement(el: Element, target: unknown, cleanups: Cleanup[]): void {
  assertWritable(target, "bind-element");
  const store = target;
  store.value = el;
  cleanups.push(() => {
    store.value = null;
  });
}
