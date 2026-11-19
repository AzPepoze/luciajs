import { discrete, type Interpolator } from "./interpolator.ts";
import { interpolateText } from "./text.ts";

/**
 * Blends any two values: numbers, strings (with numbers, units and colors), arrays and plain objects.
 * `probe` is the element that var() and named colors are resolved on. Without it a detached probe is used.
 */
export function interpolate(from: unknown, to: unknown, probe?: HTMLElement): Interpolator {
  if (Object.is(from, to)) return () => from;
  if (typeof from === "number" && typeof to === "number") return lerp(from, to);
  if (typeof from === "string" && typeof to === "string") return interpolateText(from, to, probe);
  if (Array.isArray(from) && Array.isArray(to) && from.length === to.length)
    return interpolateArray(from, to, probe);
  if (isPlainObject(from) && isPlainObject(to) && sameKeys(from, to))
    return interpolateObject(from, to, probe);
  return discrete(from, to);
}

function lerp(from: number, to: number): Interpolator {
  const delta = to - from;
  return (t) => from + delta * t;
}

function interpolateArray(
  from: unknown[],
  to: unknown[],
  probe: HTMLElement | undefined,
): Interpolator {
  const parts = from.map((value, i) => interpolate(value, to[i], probe));
  return (t) => parts.map((part) => part(t));
}

function interpolateObject(
  from: Record<string, unknown>,
  to: Record<string, unknown>,
  probe: HTMLElement | undefined,
): Interpolator {
  const keys = Object.keys(from);
  const parts = keys.map((key) => interpolate(from[key], to[key], probe));
  return (t) => Object.fromEntries(keys.map((key, i) => [key, parts[i]!(t)]));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype
  );
}

function sameKeys(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => key in b);
}
