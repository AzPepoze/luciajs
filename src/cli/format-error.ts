import type { LuciaError } from "@compiler/errors.ts";
import { relative } from "node:path";
import { ANSI, paint } from "./color.ts";

const CONTEXT_LINES = 2;

/** Prints an error like tsc: a location line, a code frame, then the hint. */
export function formatError(error: LuciaError, source: string | undefined, color: boolean): string {
  const paintWith = (text: string, code: string): string => (color ? paint(text, code) : text);
  const parts = [headline(error, paintWith)];
  const frame = source === undefined ? undefined : codeFrame(error, source, paintWith);
  if (frame) parts.push("", frame);
  if (error.hint) parts.push("", `${paintWith("hint", ANSI.cyan)}: ${error.hint}`);
  return parts.join("\n");
}

type Painter = (text: string, code: string) => string;

function headline(error: LuciaError, paintWith: Painter): string {
  const code = error.code ? ` ${error.code}` : "";
  const message = `${paintWith("error", ANSI.red)}${paintWith(code, ANSI.red)}: ${error.message}`;
  if (error.file === undefined || error.line === undefined) return message;
  const place = `${paintWith(displayPath(error.file), ANSI.cyan)}:${paintWith(`${error.line}:${error.column ?? 1}`, ANSI.yellow)}`;
  return `${place} - ${message}`;
}

function displayPath(file: string): string {
  return file.startsWith("/") ? relative(process.cwd(), file) : file;
}

function codeFrame(error: LuciaError, source: string, paintWith: Painter): string | undefined {
  if (error.line === undefined) return undefined;
  const lines = source.split("\n");
  const errorRow = error.line - 1;
  const first = Math.max(0, errorRow - CONTEXT_LINES);
  const last = Math.min(lines.length - 1, errorRow + CONTEXT_LINES);
  const width = String(last + 1).length;
  const rows: string[] = [];
  for (let row = first; row <= last; row++) {
    const number = paintWith(String(row + 1).padStart(width), ANSI.dim);
    rows.push(`${number} | ${lines[row]}`);
    if (row === errorRow) rows.push(`${" ".repeat(width)} | ${paintWith(caret(error), ANSI.red)}`);
  }
  return rows.join("\n");
}

/** `^` at the error column, then `~` for the rest of the span. */
function caret(error: LuciaError): string {
  const offset = " ".repeat(Math.max(0, (error.column ?? 1) - 1));
  const tildes = "~".repeat(Math.max(0, (error.length ?? 1) - 1));
  return `${offset}^${tildes}`;
}
