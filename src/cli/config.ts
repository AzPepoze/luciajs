import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { lusiaError } from "@compiler/errors/create.ts";
import { LusiaError } from "@compiler/errors.ts";
import { LAZY_MODES, LAZY_PREFETCH, type LazyMode, type LazyPrefetch } from "@compiler/lazy/options.ts";

export const CONFIG_FILE = "lusia.config.json";

export interface LusiaConfig {
  outdir?: string;
  minify?: boolean;
  routes?: string[];
  dev?: { port?: number };
  lazy?: { mode?: LazyMode; prefetch?: LazyPrefetch };
}

type JsonObject = Record<string, unknown>;

/** Reads the app folder's lusia.config.json. A missing file means no settings. */
export function readConfig(dir: string): LusiaConfig {
  const file = join(dir, CONFIG_FILE);
  if (!existsSync(file)) return {};
  return parseConfig(readFileSync(file, "utf8"));
}

export function parseConfig(text: string): LusiaConfig {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw configError(`not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  return checkRoot(value);
}

/** True for a client route such as /guide: it starts with a slash and has no "..". */
export function isRoute(route: string): boolean {
  return route.startsWith("/") && !route.includes("..");
}

function checkRoot(value: unknown): LusiaConfig {
  const root = asObject(value, "the file must hold a JSON object");
  checkKeys(root, ["$schema", "outdir", "minify", "routes", "dev", "lazy"]);
  return {
    outdir: optionalString(root, "outdir"),
    minify: optionalBoolean(root, "minify"),
    routes: optionalRoutes(root),
    dev: optionalDev(root),
    lazy: optionalLazy(root),
  };
}

function optionalDev(root: JsonObject): LusiaConfig["dev"] {
  if (root.dev === undefined) return undefined;
  const dev = asObject(root.dev, '"dev" must be an object');
  checkKeys(dev, ["port"], "dev");
  return { port: optionalPort(dev) };
}

function optionalPort(dev: JsonObject): number | undefined {
  if (dev.port === undefined) return undefined;
  const port = dev.port;
  if (typeof port !== "number" || !Number.isInteger(port) || port < 0 || port > 65535)
    throw configError('"dev.port" must be a whole number from 0 to 65535');
  return port;
}

function optionalLazy(root: JsonObject): LusiaConfig["lazy"] {
  if (root.lazy === undefined) return undefined;
  const lazy = asObject(root.lazy, '"lazy" must be an object');
  checkKeys(lazy, ["mode", "prefetch"], "lazy");
  return {
    mode: oneOf(lazy.mode, LAZY_MODES, "lazy.mode"),
    prefetch: oneOf(lazy.prefetch, LAZY_PREFETCH, "lazy.prefetch"),
  };
}

function optionalRoutes(root: JsonObject): string[] | undefined {
  if (root.routes === undefined) return undefined;
  if (!Array.isArray(root.routes)) throw configError('"routes" must be a list of paths');
  for (const route of root.routes) {
    if (typeof route !== "string" || !isRoute(route))
      throw configError(`invalid route "${String(route)}", use a path such as /guide`);
  }
  return root.routes as string[];
}

function optionalString(root: JsonObject, key: string): string | undefined {
  const value = root[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value === "") throw configError(`"${key}" must be text`);
  return value;
}

function optionalBoolean(root: JsonObject, key: string): boolean | undefined {
  const value = root[key];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") throw configError(`"${key}" must be true or false`);
  return value;
}

function oneOf<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  key: string,
): T[number] | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && allowed.includes(value)) return value;
  throw configError(`"${key}" must be one of: ${allowed.join(", ")}`);
}

function asObject(value: unknown, detail: string): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw configError(detail);
  return value as JsonObject;
}

function checkKeys(object: JsonObject, allowed: readonly string[], parent?: string): void {
  for (const key of Object.keys(object)) {
    if (allowed.includes(key)) continue;
    const where = parent ? ` in "${parent}"` : "";
    throw configError(`unknown key "${key}"${where}, allowed: ${allowed.join(", ")}`);
  }
}

function configError(detail: string): LusiaError {
  return lusiaError("L3004", { message: `${CONFIG_FILE}: ${detail}` });
}
