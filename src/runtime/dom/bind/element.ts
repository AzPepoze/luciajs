import type { Cleanup } from "../bindings.ts";
import { assertWritable } from "./channel.ts";
import { withWhere } from "../../errors.ts";
import type { Variable } from "../../variable/variable.ts";

/** `bind-element={ref}`: the variable holds the element while it is attached. */
export function bindElement(
  el: Element,
  target: unknown,
  cleanups: Cleanup[],
  where?: string,
): void {
  withWhere(where, () => assertWritable(target, "bind-element"));
  const variable = target as Variable<unknown>;
  variable.value = el;
  cleanups.push(() => {
    variable.value = null;
  });
}
