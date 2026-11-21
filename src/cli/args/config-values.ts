import { lusiaError } from "@compiler/errors/create.ts";
import type { LusiaError } from "@compiler/errors/error.ts";
import { CONFIG_FILE } from "./config-types.ts";

export type JsonObject = Record<string, unknown>;

/** True for a client route such as /guide: it starts with a slash and has no "..". */
export function isRoute(route: string): boolean {
  return route.startsWith("/") && !route.includes("..");
}

export function optionalString(root: JsonObject, key: string): string | undefined {
  const value = root[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value === "") throw configError(`"${key}" must be text`);
  return value;
}

export function optionalBoolean(root: JsonObject, key: string): boolean | undefined {
  const value = root[key];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") throw configError(`"${key}" must be true or false`);
  return value;
}

export function oneOf<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  key: string,
): T[number] | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && allowed.includes(value)) return value;
  throw configError(`"${key}" must be one of: ${allowed.join(", ")}`);
}

export function asObject(value: unknown, detail: string): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw configError(detail);
  return value as JsonObject;
}

export function checkKeys(object: JsonObject, allowed: readonly string[], parent?: string): void {
  for (const key of Object.keys(object)) {
    if (allowed.includes(key)) continue;
    const where = parent ? ` in "${parent}"` : "";
    throw configError(`unknown key "${key}"${where}, allowed: ${allowed.join(", ")}`);
  }
}

export function configError(detail: string): LusiaError {
  return lusiaError("L3004", { message: `${CONFIG_FILE}: ${detail}` });
}
