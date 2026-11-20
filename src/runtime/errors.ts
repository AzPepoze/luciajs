// Relative imports: the runtime ships to apps, where the @compiler alias does not resolve.
import { luciaError, type Values } from "../compiler/errors/create.ts";
import type { ErrorCodeName } from "../compiler/errors/codes.ts";
import { parseWhere } from "../compiler/errors/where.ts";
import type { LuciaError } from "../compiler/errors.ts";

/** The location of each key that a dev build found wrong, by key name. */
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

/** The location for an error about `key`: the key's own spot when the dev build found it, else `where`. */
function locationOf(key: string | undefined): string | undefined {
  if (key !== undefined && keyWheres && Object.hasOwn(keyWheres, key)) return keyWheres[key];
  return where;
}

/** In a dev build the location is also added to the message, so the browser console shows it. */
export function runtimeError(code: ErrorCodeName, values?: Values, key?: string): LuciaError {
  const at = locationOf(key);
  if (at === undefined) return luciaError(code, values);
  const error = luciaError(code, values, parseWhere(at));
  error.message = `${error.message} (${at})`;
  return error;
}
