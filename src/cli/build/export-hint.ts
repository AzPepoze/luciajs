import { readFileSync } from "node:fs";
import { RENAMED_EXPORTS } from "./renamed-exports.ts";

const DEFAULT_HINT = "Check the name, or see reference/api.ts.";
const MIN_DISTANCE_LIMIT = 2;
const DISTANCE_DIVISOR = 3;

/** The hint for an import name the module does not export. */
export function missingExportHint(name: string, exportNames: string[]): string {
  const renamed = RENAMED_EXPORTS.get(name);
  if (renamed !== undefined) return renamed;
  const closest = closestName(name, exportNames);
  return closest === undefined ? DEFAULT_HINT : `Did you mean "${closest}"?`;
}

/** The names a module exports directly. `export *` re-exports are not followed. Returns [] when the module cannot be read. */
export function exportsOf(specifier: string, fromDir: string): string[] {
  try {
    const path = Bun.resolveSync(specifier, fromDir);
    return new Bun.Transpiler({ loader: "ts" }).scan(readFileSync(path, "utf8")).exports;
  } catch {
    return [];
  }
}

function closestName(name: string, candidates: string[]): string | undefined {
  const limit = Math.max(MIN_DISTANCE_LIMIT, Math.floor(name.length / DISTANCE_DIVISOR));
  let best: string | undefined;
  let bestDistance = limit + 1;
  for (const candidate of candidates) {
    const distance = editDistance(name.toLowerCase(), candidate.toLowerCase());
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

/** Levenshtein distance: the fewest single-character inserts, deletes and changes. */
function editDistance(from: string, to: string): number {
  let previous = Array.from({ length: to.length + 1 }, (_, column) => column);
  for (let row = 1; row <= from.length; row++) {
    const current = [row];
    for (let column = 1; column <= to.length; column++) {
      const cost = from[row - 1] === to[column - 1] ? 0 : 1;
      current[column] = Math.min(
        previous[column]! + 1,
        current[column - 1]! + 1,
        previous[column - 1]! + cost,
      );
    }
    previous = current;
  }
  return previous[to.length]!;
}
