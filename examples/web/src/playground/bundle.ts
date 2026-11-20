import {
  cleanSyntaxMessage,
  compileForBrowser,
  LuciaError,
  stripTypes,
} from "@compiler/browser.ts";
import { findBrokenImports, linkImports, type BrokenImport } from "./imports.ts";
import { ENTRY_FILE } from "./names.ts";
import type { PlayError, PlayFile } from "./types.ts";

export interface Bundle {
  entry: string;
  /** Plain JavaScript by file name. Imports between files already use the module names. */
  modules: Record<string, string>;
}

export interface BuildResult {
  /** Set only when every file compiled and every import resolves. */
  bundle?: Bundle;
  errors: PlayError[];
  /** True when a style is not plain CSS, which the playground does not compile. */
  hasSass: boolean;
}

interface CompiledFile {
  code: string;
  hasSass: boolean;
}

// Compiles every file with the browser compiler, then strips TypeScript from it. Errors are collected per file.
export function buildBundle(files: readonly PlayFile[]): BuildResult {
  const names = new Set(files.map((file) => file.name));
  const errors: PlayError[] = [];
  const modules: Record<string, string> = {};
  let hasSass = false;
  if (!names.has(ENTRY_FILE)) errors.push({ message: `${ENTRY_FILE} is missing.` });
  for (const file of files) {
    errors.push(...findBrokenImports(file.code, names).map((item) => brokenError(file.name, item)));
    try {
      const compiled = compileFile(file);
      hasSass ||= compiled.hasSass;
      modules[file.name] = linkImports(compiled.code, names);
    } catch (error) {
      errors.push(toPlayError(error, file.name));
    }
  }
  if (errors.length > 0) return { errors, hasSass };
  return { bundle: { entry: ENTRY_FILE, modules }, errors, hasSass };
}

function compileFile(file: PlayFile): CompiledFile {
  if (file.name.endsWith(".lucia")) return compileForBrowser(file.code, file.name);
  return { code: stripTypes(file.code, file.name), hasSass: false };
}

function brokenError(file: string, item: BrokenImport): PlayError {
  return {
    message: `Cannot find ${item.specifier}.`,
    hint: "Import a file from this list, using its full name, such as ./Card.lucia.",
    file,
    line: item.line,
  };
}

function toPlayError(error: unknown, file: string): PlayError {
  if (error instanceof LuciaError) {
    return {
      message: error.message,
      code: error.code,
      hint: error.hint,
      file,
      line: error.line,
      column: error.column,
    };
  }
  const loc = syntaxLocation(error);
  if (loc)
    return { message: cleanSyntaxMessage(loc.message), file, line: loc.line, column: loc.column };
  return { message: error instanceof Error ? error.message : String(error), file };
}

// A .ts file's syntax error from sucrase carries its position in `loc`.
function syntaxLocation(
  error: unknown,
): { message: string; line: number; column: number } | undefined {
  if (!(error instanceof SyntaxError)) return undefined;
  const loc = (error as { loc?: { line: number; column: number } }).loc;
  return loc ? { message: error.message, line: loc.line, column: loc.column } : undefined;
}
