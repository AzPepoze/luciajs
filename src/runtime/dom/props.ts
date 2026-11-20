import { variable } from "../variable/variable.ts";
import type { ComputedVariable } from "../variable/compute.ts";
import { currentComponentProps } from "./component.ts";

export type PropVariables<D> = { readonly [K in keyof D]: ComputedVariable<D[K]> };

/** Declare the props this component reads, with their defaults; each one comes back as a computed variable. */
export function props<D extends Record<string, unknown>>(defaults: D): PropVariables<D> {
  const passed = currentComponentProps();
  const variables = {} as Record<string, ComputedVariable<unknown>>;
  for (const key in defaults) {
    const read = passed[key];
    const fallback = defaults[key];
    variables[key] = variable.compute(() => read?.() ?? fallback);
  }
  return variables as PropVariables<D>;
}
