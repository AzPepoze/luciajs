import { existsSync, statSync } from "node:fs";
import { UsageError } from "./usage-error.ts";

/** The config file lives in the app folder, so a path that is a folder names it. */
export function configDir(paths: string[]): string {
  return paths.find(isFolder) ?? ".";
}

export function pathsOf(positionals: string[]): string[] {
  return positionals.length === 0 ? ["."] : positionals;
}

export function appDir(positionals: string[]): string {
  if (positionals.length > 1) throw new UsageError("expected one app folder");
  return positionals[0] ?? ".";
}

function isFolder(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}
