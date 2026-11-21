import type { LazySettings } from "@bun-plugin/children.ts";
import type { LintRuleSettings } from "@language/lint/lint.ts";

export type Command =
  | { name: "help" }
  | {
      name: "build";
      dir: string;
      outdir: string;
      minify: boolean;
      routes: string[];
      quiet: boolean;
      lazy: LazySettings;
    }
  | {
      name: "dev";
      dir: string;
      port: number;
      quiet: boolean;
      lazy: LazySettings;
    }
  | {
      name: "format";
      paths: string[];
      check: boolean;
      quiet: boolean;
      cache: boolean;
    }
  | {
      name: "lint";
      paths: string[];
      fix: boolean;
      maxWarnings: number;
      quiet: boolean;
      rules: LintRuleSettings | undefined;
    };
