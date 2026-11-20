import type { Cleanup } from "./bindings.ts";
import { componentFrom, type Component, type Host, type Place } from "./component.ts";
import type { Leave } from "./leave.ts";
import { runtimeError } from "../errors.ts";

export type LazyLoad = () => Promise<{ default: Component }>;

export interface LazyOptions {
  /** Shown in place of the component until it has loaded. */
  fallback?: Component;
}

const noop: Cleanup = () => {};

/**
 * Makes a component load only when it is first placed. `load` is a dynamic import, so the bundler
 * puts the component in its own chunk. The loaded component is kept for later placements.
 */
export function lazy(load: LazyLoad, options: LazyOptions = {}): Component {
  let loaded: Component | undefined;
  const place: Place = (parent, anchor, host, leaves) => {
    if (loaded) return loaded.place(parent, anchor, host, leaves);
    return placeLoading(load, options.fallback, parent, anchor, host, leaves, (component) => {
      loaded = component;
    });
  };
  return componentFrom(place);
}

function placeLoading(
  load: LazyLoad,
  fallback: Component | undefined,
  parent: Node,
  anchor: Node | null,
  host: Host,
  leaves: Leave[],
  remember: (component: Component) => void,
): Cleanup {
  // The marker keeps the position while the fallback and then the component come and go.
  const marker = document.createComment("");
  parent.insertBefore(marker, anchor);
  let removeFallback: Cleanup = fallback
    ? fallback.place(parent, marker, { props: {}, bound: {} }, [])
    : noop;
  let removeLoaded: Cleanup = noop;
  let detached = false;

  load().then(
    (module) => {
      remember(module.default);
      if (detached) return;
      removeFallback();
      removeFallback = noop;
      // The parent may have changed since placement: it can be a fragment that was already emptied.
      removeLoaded = module.default.place(marker.parentNode!, marker, host, leaves);
    },
    (error: unknown) => {
      reportError(runtimeError("L2057",{ message: messageOf(error) }));
    },
  );

  return () => {
    detached = true;
    removeFallback();
    removeLoaded();
    marker.remove();
  };
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
