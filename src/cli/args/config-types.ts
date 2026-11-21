import type { AnimateConfig } from "@runtime/animate/options/config.ts";
import type { LazyMode, LazyPrefetch } from "@compiler/lazy/options.ts";
import type { LintRuleSettings } from "@language/lint/lint.ts";

export const JSON_CONFIG_FILE = "lusia.config.json";
export const TS_CONFIG_FILE = "lusia.config.ts";
export const CONFIG_FILES = [TS_CONFIG_FILE, JSON_CONFIG_FILE];

export interface LusiaConfig {
  outdir?: string;
  minify?: boolean;
  routes?: string[];
  dev?: { port?: number };
  lazy?: { mode?: LazyMode; prefetch?: LazyPrefetch };
  lint?: { rules?: LintRuleSettings };
  animate?: AnimateConfig;
}
