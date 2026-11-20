// Relative imports: the runtime ships to apps, where the @compiler alias does not resolve.
import { luciaError, type Values } from "../compiler/errors/create.ts";
import type { ErrorCodeName } from "../compiler/errors/codes.ts";
import { parseWhere } from "../compiler/errors/where.ts";
import type { LuciaError } from "../compiler/errors.ts";

let where: string | undefined;

/** Runs `read` so that any runtime error it raises points at `at` (a dev build's `file:line:column`). */
export function withWhere<T>(at: string | undefined, read: () => T): T {
  const previous = where;
  where = at;
  try {
    return read();
  } finally {
    where = previous;
  }
}

/** In a dev build the location is also added to the message, so the browser console shows it. */
export function runtimeError(code: ErrorCodeName, values?: Values): LuciaError {
  if (where === undefined) return luciaError(code, values);
  const error = luciaError(code, values, parseWhere(where));
  error.message = `${error.message} (${where})`;
  return error;
}
