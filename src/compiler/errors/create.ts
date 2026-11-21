import { LusiaError } from "./error.ts";
import { CODES, type ErrorCodeName } from "./codes.ts";

export type Values = Record<string, string | number>;

export interface Span {
  file: string;
  line: number;
  column: number;
  length?: number;
}

const PLACEHOLDER = /\$(\w+)/g;

/** Replaces each $name with its value. A name with no value stays as it is. */
export function fill(template: string, values: Values = {}): string {
  return template.replace(PLACEHOLDER, (match, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  );
}

export function lusiaError(code: ErrorCodeName, values: Values = {}, span?: Span): LusiaError {
  const entry = CODES[code];
  return new LusiaError(fill(entry.message, values), span?.file, span?.line, span?.column, {
    code,
    hint: fill(entry.hint, values),
    length: span?.length,
  });
}
