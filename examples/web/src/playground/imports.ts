/** The prefix of a playground module in the frame's import map. */
export const MODULE_PREFIX = "@playground/";

// Matches `from "./Name"` and `import("./Name")`. Playground files sit in one folder, so only "./" names exist.
const RELATIVE_IMPORT = /(\bfrom\s*|\bimport\s*\(\s*)(["'])\.\/([^"'\n]+)\2/g;

export interface BrokenImport {
  specifier: string;
  line: number;
}

/** The imports in `source` that name no file. Lines start at 1. */
export function findBrokenImports(source: string, names: ReadonlySet<string>): BrokenImport[] {
  const broken: BrokenImport[] = [];
  for (const match of source.matchAll(RELATIVE_IMPORT)) {
    const name = match[3] ?? "";
    if (names.has(name)) continue;
    const line = source.slice(0, match.index).split("\n").length;
    broken.push({ specifier: `./${name}`, line });
  }
  return broken;
}

/** Points each import of a playground file at that file's module name. Other imports are kept. */
export function linkImports(code: string, names: ReadonlySet<string>): string {
  return code.replace(RELATIVE_IMPORT, (whole, lead: string, quote: string, name: string) =>
    names.has(name) ? `${lead}${quote}${MODULE_PREFIX}${name}${quote}` : whole,
  );
}
