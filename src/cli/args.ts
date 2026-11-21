import { parseArgs } from "node:util";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import type { LazySettings } from "@bun-plugin/children.ts";
import type { LintRuleSettings } from "@language/lint/lint.ts";
import { isRoute, readConfig, type LusiaConfig } from "./config.ts";

export class UsageError extends Error {}

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

const DEFAULT_PORT = 3000;
const DEFAULT_OUTDIR = "dist";
const DEFAULT_LAZY_MODE = "smart";
const DEFAULT_LAZY_PREFETCH = "idle";

export function parseCommand(argv: string[], env: Record<string, string | undefined>): Command {
  const [name, ...rest] = argv;
  if (!name || name === "help" || name === "--help" || name === "-h") return { name: "help" };
  if (name === "build") return parseBuild(rest);
  if (name === "dev") return parseDev(rest, env);
  if (name === "format") return parseFormat(rest);
  if (name === "lint") return parseLint(rest);
  throw new UsageError(`unknown command "${name}"`);
}

function parseBuild(args: string[]): Command {
  const { values, positionals } = withUsageErrors(() =>
    parseArgs({
      args,
      allowPositionals: true,
      options: {
        outdir: { type: "string" },
        "no-minify": { type: "boolean" },
        routes: { type: "string" },
        quiet: { type: "boolean" },
      },
    }),
  );
  const dir = appDir(positionals);
  const config = readConfig(dir);
  return {
    name: "build",
    dir,
    outdir: outdirOf(dir, values.outdir, config),
    minify: values["no-minify"] ? false : (config.minify ?? true),
    routes: values.routes === undefined ? (config.routes ?? []) : parseRoutes(values.routes),
    quiet: values.quiet ?? false,
    lazy: lazyOf(config),
  };
}

/** The flag follows the current folder; the file and the default follow the app folder. */
function outdirOf(dir: string, flag: string | undefined, config: LusiaConfig): string {
  if (flag !== undefined) return resolve(flag);
  return resolve(dir, config.outdir ?? DEFAULT_OUTDIR);
}

/** The lazy settings from the config file, with the defaults for what it leaves out. */
function lazyOf(config: LusiaConfig): LazySettings {
  return {
    mode: config.lazy?.mode ?? DEFAULT_LAZY_MODE,
    prefetch: config.lazy?.prefetch ?? DEFAULT_LAZY_PREFETCH,
  };
}

/** `--routes /guide,/reference` becomes a list of paths. Each must start with a slash and hold no `..`. */
export function parseRoutes(value: string | undefined): string[] {
  if (value === undefined) return [];
  const routes = value
    .split(",")
    .map((route) => route.trim())
    .filter(Boolean);
  for (const route of routes) {
    if (!isRoute(route))
      throw new UsageError(`invalid route "${route}", use a path such as /guide`);
  }
  return routes;
}

function parseDev(args: string[], env: Record<string, string | undefined>): Command {
  const { values, positionals } = withUsageErrors(() =>
    parseArgs({
      args,
      allowPositionals: true,
      options: { port: { type: "string" }, quiet: { type: "boolean" } },
    }),
  );
  const dir = appDir(positionals);
  const config = readConfig(dir);
  const port = values.port ?? env.PORT;
  return {
    name: "dev",
    dir,
    port: port === undefined ? (config.dev?.port ?? DEFAULT_PORT) : parsePort(port),
    quiet: values.quiet ?? false,
    lazy: lazyOf(config),
  };
}

function parseFormat(args: string[]): Command {
  const { values, positionals } = withUsageErrors(() =>
    parseArgs({
      args,
      allowPositionals: true,
      options: {
        check: { type: "boolean" },
        quiet: { type: "boolean" },
        "no-cache": { type: "boolean" },
      },
    }),
  );
  return {
    name: "format",
    paths: pathsOf(positionals),
    check: values.check ?? false,
    quiet: values.quiet ?? false,
    cache: values["no-cache"] !== true,
  };
}

function parseLint(args: string[]): Command {
  const { values, positionals } = withUsageErrors(() =>
    parseArgs({
      args,
      allowPositionals: true,
      options: {
        fix: { type: "boolean" },
        "max-warnings": { type: "string" },
        quiet: { type: "boolean" },
      },
    }),
  );
  const config = readConfig(configDir(positionals));
  return {
    name: "lint",
    paths: pathsOf(positionals),
    fix: values.fix ?? false,
    maxWarnings: parseMaxWarnings(values["max-warnings"]),
    quiet: values.quiet ?? false,
    rules: config.lint?.rules,
  };
}

/** The config file lives in the app folder, so a path that is a folder names it. */
function configDir(paths: string[]): string {
  return paths.find(isFolder) ?? ".";
}

function isFolder(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}

function pathsOf(positionals: string[]): string[] {
  return positionals.length === 0 ? ["."] : positionals;
}

function parseMaxWarnings(value: string | undefined): number {
  if (value === undefined) return Number.POSITIVE_INFINITY;
  if (!/^\d+$/.test(value))
    throw new UsageError(`invalid max warnings "${value}", use a whole number from 0`);
  return Number(value);
}

function withUsageErrors<T>(parse: () => T): T {
  try {
    return parse();
  } catch (error) {
    throw new UsageError(error instanceof Error ? error.message : String(error));
  }
}

function appDir(positionals: string[]): string {
  if (positionals.length > 1) throw new UsageError("expected one app folder");
  return positionals[0] ?? ".";
}

function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535)
    throw new UsageError(`invalid port "${value}"`);
  return port;
}
