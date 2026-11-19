import type { Span } from "./create.ts";

/** The compact `file:line:column` string the dev build passes to runtime checks. */
export function formatWhere(file: string, line: number, column: number): string {
  return `${file}:${line}:${column}`;
}

/** Reads a `file:line:column` string back. The file part may itself contain colons. */
export function parseWhere(where: string): Span | undefined {
  const match = /^(.*):(\d+):(\d+)$/.exec(where);
  if (!match) return undefined;
  return { file: match[1]!, line: Number(match[2]), column: Number(match[3]) };
}
