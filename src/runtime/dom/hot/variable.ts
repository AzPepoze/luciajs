import type { Variable } from "../../variable/variable.ts";
import { currentFrame } from "./render.ts";

// Dev builds wrap each top-level `variable(...)`. A name seen before the last hot swap keeps its value.
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
