import type { LazyMode, LazyPrefetch } from "@compiler/lazy/options.ts";
import type { LintRuleSettings } from "@language/lint/lint.ts";

export const CONFIG_FILE = "lusia.config.json";

export interface LusiaConfig {
  outdir?: string;
  minify?: boolean;
  routes?: string[];
  dev?: { port?: number };
  lazy?: { mode?: LazyMode; prefetch?: LazyPrefetch };
  lint?: { rules?: LintRuleSettings };
}
