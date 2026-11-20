import * as publicApi from "@runtime/index.ts";
import * as internalApi from "@runtime/internal.ts";
import type { BunPlugin } from "bun";

/** The bare name the page's import map points at the runtime module (see `RUNTIME_PATH`). */
export const RUNTIME_SPECIFIER = "lusia-runtime";

const SHIM_NAMESPACE = "lusia-shim";

/** True for a build input that is a runtime shim, not a file. */
export function isShimInput(input: string): boolean {
  return input.startsWith(`${SHIM_NAMESPACE}:`);
}

/**
 * Dev builds leave `lusia` out of the bundle, so the app and hot updates share one runtime. The
 * shim still lists the real export names, so Bun reports a missing name at build time (L3001).
 */
export function runtimeShim(): BunPlugin {
  return {
    name: "lusia-runtime-shim",
    setup(build) {
      build.onResolve({ filter: /^lusia$/ }, () => ({ path: "lusia", namespace: SHIM_NAMESPACE }));
      build.onResolve({ filter: /^lusia\/internal$/ }, () => ({
        path: "lusia/internal",
        namespace: SHIM_NAMESPACE,
      }));
      build.onLoad({ filter: /.*/, namespace: SHIM_NAMESPACE }, ({ path }) => ({
        contents: reexport(path === "lusia" ? publicApi : internalApi),
        loader: "js",
      }));
    },
  };
}

function reexport(namespace: object): string {
  const names = Object.keys(namespace).join(", ");
  return `export { ${names} } from "${RUNTIME_SPECIFIER}";`;
}
