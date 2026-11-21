import { runtimeError } from "../../errors.ts";

/** A time in ms: the value when it is set, otherwise the fallback. */
export function readMs(value: number | undefined, fallback: number, name: string): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value) || value < 0)
    throw runtimeError("L2003", { name, value: String(value) });
  return value;
}
