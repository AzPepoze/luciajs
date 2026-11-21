import { runtimeError } from "@runtime/errors.ts";
import type { Keyframes } from "./keyframes.ts";
import type { MoreBase } from "./trigger-options.ts";

/** The `more` options of WHEN.HOVER. Times are in ms. `out` replaces the play back for leaving. */
export interface HoverMore {
  inDelay?: number;
  outDelay?: number;
  out?: Keyframes;
  outDuration?: number;
}

/** The checked HOVER options. `out` is the keyframes for leaving, with its duration. */
export interface HoverRead {
  inDelay: number;
  outDelay: number;
  out: { keyframes: Keyframes; duration: number } | undefined;
}

export const DEFAULT_HOVER: HoverRead = { inDelay: 0, outDelay: 0, out: undefined };

export function readHover(more: HoverMore, base: MoreBase): HoverRead {
  if (more.out === undefined && more.outDuration !== undefined) throw runtimeError("L2013");
  return {
    inDelay: readMs(more.inDelay, "inDelay"),
    outDelay: readMs(more.outDelay, "outDelay"),
    out: more.out === undefined ? undefined : readOut(more, base),
  };
}

export function sameHover(a: HoverRead, b: HoverRead): boolean {
  return (
    a.inDelay === b.inDelay &&
    a.outDelay === b.outDelay &&
    a.out?.keyframes === b.out?.keyframes &&
    a.out?.duration === b.out?.duration
  );
}

function readOut({ out, outDuration }: HoverMore, base: MoreBase): NonNullable<HoverRead["out"]> {
  if (typeof out !== "object" || out === null || Array.isArray(out)) {
    throw runtimeError("L2014");
  }
  return { keyframes: out, duration: readMs(outDuration, "outDuration", base.duration) };
}

function readMs(value: number | undefined, name: string, fallback = 0): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value) || value < 0)
    throw runtimeError("L2003", { name: `more ${name}`, value: String(value) });
  return value;
}
