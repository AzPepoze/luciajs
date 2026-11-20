import type { Variable } from "../../variable/variable.ts";
import { currentFrame } from "./render.ts";

/**
 * Dev builds wrap each top-level `variable(...)` in this. The variable takes the value it had before the
 * last hot swap, found by variable name. A name that is new starts from its initial value.
 */
export function hotVariable<T>(name: string, created: Variable<T>): Variable<T> {
  const frame = currentFrame();
  if (!frame) return created;
  frame.variables.set(name, created as Variable<unknown>);
  const restore = frame.instance.restore;
  if (restore?.has(name) && isWritable(created)) created.value = restore.get(name) as T;
  return created;
}

function isWritable(variable: object): boolean {
  return Object.getOwnPropertyDescriptor(variable, "value")?.set !== undefined;
}
