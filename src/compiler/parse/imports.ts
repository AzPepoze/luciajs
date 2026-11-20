import { luciaError, type Values } from "../errors/create.ts";
import type { ErrorCodeName } from "../errors/codes.ts";
import { RESERVED_TAGS } from "../utils/reserved.ts";
import { columnAt, lineAt } from "../utils/position.ts";
import type { Section } from "./sections.ts";

export interface SplitScript {
  /** Import statements, hoisted to module level so they run once per file. */
  imports: string;
  /** The rest of the script, run once per instance. */
  body: string;
  /** Default-import names of `.lucia` files, usable as tags in markup. */
  components: Set<string>;
}

const IMPORT_STATEMENT = /^[ \t]*import(?!\s*\()\s[^"']*?(["'])([^"'\n]+)\1[ \t]*;?/gm;
const EXPORT_STATEMENT = /^[ \t]*export\b/m;
const DEFAULT_IMPORT = /^\s*import\s+(?!type\s)([A-Za-z_$][\w$]*)\s*(?:,|from\b)/;
// A top-level `const Name = lazy(...)` is a component too, so it can be used as a tag.
const LAZY_DECLARATION = /^const\s+([A-Za-z_$][\w$]*)\s*=\s*lazy\s*\(/gm;

function defaultLuciaImport(statement: string, specifier: string): string | undefined {
  if (!specifier.endsWith(".lucia")) return undefined;
  return DEFAULT_IMPORT.exec(statement)?.[1];
}

/** An error at `offset` inside the script section, reported with the file position. */
function scriptError(
  script: Section,
  offset: number,
  file: string,
  code: ErrorCodeName,
  values?: Values,
) {
  const line = script.line - 1 + lineAt(script.content, offset);
  return luciaError(code, values, { file, line, column: columnAt(script.content, offset) });
}

function rejectExports(script: Section, file: string): void {
  const match = EXPORT_STATEMENT.exec(script.content);
  if (!match) return;
  const at = match.index + match[0].length - "export".length;
  throw scriptError(script, at, file, "L1003");
}

export function splitImports(section: Section | null, file: string): SplitScript {
  if (!section) return { imports: "", body: "", components: new Set() };
  rejectExports(section, file);
  const script = section.content;
  const imports: string[] = [];
  const components = new Set<string>();
  for (const match of script.matchAll(LAZY_DECLARATION)) {
    const name = match[1]!;
    if (RESERVED_TAGS.has(name)) throw scriptError(section, match.index, file, "L1004", { name });
    components.add(name);
  }
  const body = script.replace(
    IMPORT_STATEMENT,
    (statement, _quote, specifier: string, offset: number) => {
      imports.push(statement.trim());
      const name = defaultLuciaImport(statement, specifier);
      if (name && RESERVED_TAGS.has(name))
        throw scriptError(section, offset, file, "L1004", { name });
      if (name) components.add(name);
      return "";
    },
  );
  return { imports: imports.join("\n"), body, components };
}
