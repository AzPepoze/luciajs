import { LuciaError } from "../errors.ts";
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

function defaultLuciaImport(statement: string, specifier: string): string | undefined {
  if (!specifier.endsWith(".lucia")) return undefined;
  return DEFAULT_IMPORT.exec(statement)?.[1];
}

/** An error at `offset` inside the script section, reported with the file position. */
function scriptError(script: Section, offset: number, file: string, message: string): LuciaError {
  const line = script.line - 1 + lineAt(script.content, offset);
  return new LuciaError(message, file, line, columnAt(script.content, offset));
}

function rejectExports(script: Section, file: string): void {
  const match = EXPORT_STATEMENT.exec(script.content);
  if (!match) return;
  const at = match.index + match[0].length - "export".length;
  const message = "a component's <script> runs once per instance and cannot export; move shared values to a .ts file";
  throw scriptError(script, at, file, message);
}

export function splitImports(section: Section | null, file: string): SplitScript {
  if (!section) return { imports: "", body: "", components: new Set() };
  rejectExports(section, file);
  const script = section.content;
  const imports: string[] = [];
  const components = new Set<string>();
  const body = script.replace(IMPORT_STATEMENT, (statement, _quote, specifier: string, offset: number) => {
    imports.push(statement.trim());
    const name = defaultLuciaImport(statement, specifier);
    if (name && RESERVED_TAGS.has(name)) {
      throw scriptError(section, offset, file, `${name} is a reserved tag name and cannot be a component`);
    }
    if (name) components.add(name);
    return "";
  });
  return { imports: imports.join("\n"), body, components };
}
