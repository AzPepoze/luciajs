// Relative imports: the runtime ships to apps, where the @compiler alias does not resolve.
import { lusiaError, type Values } from "../compiler/errors/create.ts";
import type { ErrorCodeName } from "../compiler/errors/codes.ts";
import { parseWhere } from "../compiler/errors/where.ts";
import type { LusiaError } from "../compiler/errors/error.ts";

export type KeyWheres = Record<string, string>;

let where: string | undefined;
let keyWheres: KeyWheres | undefined;

/** Runs `read` so that any runtime error it raises points at `at` (a dev build's `file:line:column`). */
export function withWhere<T>(at: string | undefined, read: () => T, keys?: KeyWheres): T {
  const previous = where;
  const previousKeys = keyWheres;
  where = at;
  keyWheres = keys;
  try {
    return read();
  } finally {
    where = previous;
    keyWheres = previousKeys;
  }
}

function locationOf(key: string | undefined): string | undefined {
  if (key !== undefined && keyWheres && Object.hasOwn(keyWheres, key)) return keyWheres[key];
  return where;
}

export function runtimeError(code: ErrorCodeName, values?: Values, key?: string): LusiaError {
  const at = locationOf(key);
  if (at === undefined) return lusiaError(code, values);
  const error = lusiaError(code, values, parseWhere(at));
  error.message = `${error.message} (${at})`;
  return error;
}
