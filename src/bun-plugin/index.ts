import { compile, LuciaError, type CompileResult } from "@compiler/index.ts";
import { formatError } from "@cli/format-error.ts";
import { colorEnabled } from "@cli/color.ts";
import { addStep, now, type Steps } from "@cli/timings.ts";
import type { BunPlugin } from "bun";
import { cachedModule, pruneModules, storeModule, toCachedModule } from "./cache.ts";
import { moduleUpdate, type ModuleUpdate } from "./update.ts";
import { setupRaw } from "./raw.ts";

export interface LuciaPluginOptions {
  /** Dev builds keep runtime error locations. Default false. */
  dev?: boolean;
  /** Receives the time spent in the compiler (`compile`) and in Sass (`sass`). */
  steps?: Steps;
  /** Receives each .lucia file whose output was updated since the last build. */
  onUpdate?: (update: ModuleUpdate) => void;
}

export function lucia({ dev = false, steps = {}, onUpdate }: LuciaPluginOptions = {}): BunPlugin {
  return {
    name: "lucia",
    setup(build) {
      pruneModules();
      build.onLoad({ filter: /\.lucia$/ }, async ({ path }) => {
        const source = await Bun.file(path).text();
        const cached = cachedModule(path, source, dev);
        if (cached) return { contents: cached.code, loader: "ts" };

        const start = now();
        const result = compileModule(path, source, dev);
        const next = toCachedModule(source, dev, result);
        const update = moduleUpdate(path, storeModule(path, next), next);
        if (update) onUpdate?.(update);
        addStep(steps, "sass", result.sassMs);
        addStep(steps, "compile", now() - start - result.sassMs);
        return { contents: result.code, loader: "ts" };
      });
      setupRaw(build);
    },
  };
}

function compileModule(path: string, source: string, dev: boolean): CompileResult {
  try {
    return compile(source, path, { dev });
  } catch (error) {
    if (error instanceof LuciaError) throw new Error(formatError(error, source, colorEnabled()));
    throw error;
  }
}

export default lucia;
