import { store, type ReadStore } from "../store/store.ts";
import { currentComponentProps } from "./component.ts";

export type PropStores<D> = { readonly [K in keyof D]: ReadStore<D[K]> };

/** Declare the props this component reads, with their defaults; each one comes back as a read-only store. */
export function props<D extends Record<string, unknown>>(defaults: D): PropStores<D> {
  const passed = currentComponentProps();
  const stores = {} as Record<string, ReadStore<unknown>>;
  for (const key in defaults) {
    const read = passed[key];
    const fallback = defaults[key];
    stores[key] = store.from(() => read?.() ?? fallback);
  }
  return stores as PropStores<D>;
}
