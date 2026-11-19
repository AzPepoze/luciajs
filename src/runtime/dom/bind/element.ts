import type { Cleanup } from "../bindings.ts";
import { assertWritable } from "./channel.ts";
import { withWhere } from "../../errors.ts";
import type { Store } from "../../store/store.ts";

/** `bind-element={ref}`: the store holds the element while it is attached. */
export function bindElement(
  el: Element,
  target: unknown,
  cleanups: Cleanup[],
  where?: string,
): void {
  withWhere(where, () => assertWritable(target, "bind-element"));
  const store = target as Store<unknown>;
  store.value = el;
  cleanups.push(() => {
    store.value = null;
  });
}
