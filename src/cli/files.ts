import { existsSync, statSync } from "node:fs";
import { isAbsolute, join, sep } from "node:path";
import { UsageError } from "./args.ts";

const LUSIA = ".lusia";
const GLOB_CHARS = /[*?[\]{}]/;
const SKIP_FOLDERS = new Set(["node_modules", ".git", "dist", ".worktrees"]);

/** The `.lusia` files of the given files, folders and globs. No paths means the current folder. */
export async function collectFiles(
  patterns: readonly string[],
  cwd = process.cwd(),
): Promise<string[]> {
  const found = new Set<string>();
  for (const pattern of patterns.length > 0 ? patterns : ["."]) {
    await collect(pattern, cwd, found);
  }
  return [...found].sort();
}

async function collect(pattern: string, cwd: string, found: Set<string>): Promise<void> {
  const full = isAbsolute(pattern) ? pattern : join(cwd, pattern);
  if (!GLOB_CHARS.test(pattern) && existsSync(full)) {
    await collectPath(full, found);
    return;
  }
  if (GLOB_CHARS.test(pattern)) {
    await collectGlob(pattern, cwd, found);
    return;
  }
  throw new UsageError(`no such file or folder "${pattern}"`);
}

async function collectPath(path: string, found: Set<string>): Promise<void> {
  if (statSync(path).isDirectory()) {
    const files = await Array.fromAsync(
      new Bun.Glob(`**/*${LUSIA}`).scan({ cwd: path, onlyFiles: true }),
    );
    for (const file of files) {
      if (!isSkipped(file)) found.add(join(path, file));
    }
    return;
  }
  if (path.endsWith(LUSIA)) found.add(path);
}

async function collectGlob(pattern: string, cwd: string, found: Set<string>): Promise<void> {
  const root = isAbsolute(pattern) ? sep : cwd;
  const glob = new Bun.Glob(isAbsolute(pattern) ? pattern.slice(1) : pattern);
  const files = await Array.fromAsync(glob.scan({ cwd: root, onlyFiles: true }));
  for (const file of files) {
    if (!file.endsWith(LUSIA) || isSkipped(file)) continue;
    found.add(join(root, file));
  }
}

function isSkipped(path: string): boolean {
  return path.split(sep).some((folder) => SKIP_FOLDERS.has(folder));
}
