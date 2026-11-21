import { parseArgs } from "node:util";
import type { Command } from "./command.ts";
import { isRoute, readConfig } from "./config.ts";
import { appDir, configDir, pathsOf } from "./paths.ts";
import { DEFAULT_PORT, lazyOf, outdirOf } from "./settings.ts";
import { UsageError, withUsageErrors } from "./usage-error.ts";
import { parseMaxWarnings, parsePort } from "./values.ts";

export { UsageError };
export type { Command };

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
