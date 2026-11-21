import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CONFIG_FILE, type LusiaConfig } from "./config-types.ts";
import {
  asObject,
  checkKeys,
  configError,
  optionalBoolean,
  optionalString,
} from "./config-values.ts";
import { optionalDev, optionalLazy, optionalLint, optionalRoutes } from "./config-sections.ts";

export { CONFIG_FILE };
export type { LusiaConfig };
export { isRoute } from "./config-values.ts";

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

function checkRoot(value: unknown): LusiaConfig {
  const root = asObject(value, "the file must hold a JSON object");
  checkKeys(root, ["$schema", "outdir", "minify", "routes", "dev", "lazy", "lint"]);
  return {
    outdir: optionalString(root, "outdir"),
    minify: optionalBoolean(root, "minify"),
    routes: optionalRoutes(root),
    dev: optionalDev(root),
    lazy: optionalLazy(root),
    lint: optionalLint(root),
  };
}
