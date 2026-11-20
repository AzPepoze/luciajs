import { toCachedModule, storeModule, cachedModule, pruneModules } from "./cache.ts";
import { compileFile } from "./compile.ts";
import { lazyKeyFor, lazyOptionsFor, type LazySettings } from "./children.ts";
import { setupFallback } from "./fallback.ts";
import { now, addStep, type Steps } from "@cli/timings.ts";
import type { BunPlugin } from "bun";
import { moduleUpdate, type ModuleUpdate } from "./update.ts";
import { setupRaw } from "./raw.ts";

export interface LusiaPluginOptions {
  /** Dev builds keep runtime error locations. Default false. */
  dev?: boolean;
  /** Receives the time spent in the compiler (`compile`) and in Sass (`sass`). */
  steps?: Steps;
  /** Receives each .lusia file whose output was updated since the last build. */
  onUpdate?: (update: ModuleUpdate) => void;
  /** Splits imported .lusia files into their own chunks. Default: off. */
  lazy?: LazySettings;
}

export function lusia({
  dev = false,
  steps = {},
  onUpdate,
  lazy,
}: LusiaPluginOptions = {}): BunPlugin {
  return {
    name: "lusia",
    setup(build) {
      pruneModules();
      build.onLoad({ filter: /\.lusia$/ }, async ({ path }) => {
        const source = await Bun.file(path).text();
        const key = lazyKeyFor(path, source, lazy);
        const cached = cachedModule(path, source, dev, key);
        if (cached) return { contents: cached.code, loader: "ts" };

        const start = now();
        const result = compileFile(source, path, dev, lazy && lazyOptionsFor(path, lazy));
        const next = toCachedModule(source, dev, result, key);
        const update = moduleUpdate(path, storeModule(path, next), next);
        if (update) onUpdate?.(update);
        addStep(steps, "sass", result.sassMs);
        addStep(steps, "compile", now() - start - result.sassMs);
        return { contents: result.code, loader: "ts" };
      });
      setupFallback(build, dev);
      setupRaw(build);
    },
  };
}

export default lusia;
