import { parseArgs } from "node:util";
import type { LazySettings } from "@bun-plugin/children.ts";
import { isRoute, readConfig, type LuciaConfig } from "./config.ts";

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
  | { name: "dev"; dir: string; port: number; quiet: boolean; lazy: LazySettings };

const DEFAULT_PORT = 3000;
const DEFAULT_OUTDIR = "dist";
const DEFAULT_LAZY_MODE = "smart";
const DEFAULT_LAZY_PREFETCH = "idle";

export function parseCommand(argv: string[], env: Record<string, string | undefined>): Command {
  const [name, ...rest] = argv;
  if (!name || name === "help" || name === "--help" || name === "-h") return { name: "help" };
  if (name === "build") return parseBuild(rest);
  if (name === "dev") return parseDev(rest, env);
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
    outdir: values.outdir ?? config.outdir ?? DEFAULT_OUTDIR,
    minify: values["no-minify"] ? false : (config.minify ?? true),
    routes: values.routes === undefined ? (config.routes ?? []) : parseRoutes(values.routes),
    quiet: values.quiet ?? false,
    lazy: lazyOf(config),
  };
}

/** The lazy settings from the config file, with the defaults for what it leaves out. */
function lazyOf(config: LuciaConfig): LazySettings {
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
