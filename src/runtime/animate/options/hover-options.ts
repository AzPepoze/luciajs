import { runtimeError } from "../../errors.ts";
import { HOVER_AREA, type HoverArea } from "../modes/hover-modes.ts";
import type { Keyframes } from "./keyframes.ts";
import type { MoreBase } from "./trigger-options.ts";
import { animateConfig } from "./config-store.ts";
import { readMs } from "./read-ms.ts";

/** The `more` options of WHEN.HOVER. Times are in ms. `out` replaces the play back for leaving. */
export interface HoverMore {
  area?: HoverArea;
  inDelay?: number;
  outDelay?: number;
  out?: Keyframes;
  outDuration?: number;
}

export interface HoverRead {
  area: HoverArea;
  inDelay: number;
  outDelay: number;
  out: { keyframes: Keyframes; duration: number } | undefined;
}

export function hoverDefault(): HoverRead {
  const hover = animateConfig().hover ?? {};
  return {
    area: HOVER_AREA.FINAL,
    inDelay: hover.inDelay ?? 0,
    outDelay: hover.outDelay ?? 0,
    out: undefined,
  };
}

export function readHover(more: HoverMore, base: MoreBase): HoverRead {
  if (more.out === undefined && more.outDuration !== undefined) throw runtimeError("L2013");
  const fallback = hoverDefault();
  return {
    area: readArea(more.area),
    inDelay: readMs(more.inDelay, fallback.inDelay, "more inDelay"),
    outDelay: readMs(more.outDelay, fallback.outDelay, "more outDelay"),
    out: more.out === undefined ? undefined : readOut(more, base),
  };
}

function readArea(area: HoverArea | undefined): HoverArea {
  if (area === undefined) return HOVER_AREA.FINAL;
  if (area !== HOVER_AREA.FINAL && area !== HOVER_AREA.ELEMENT) throw runtimeError("L2060");
  return area;
}

export function sameHover(a: HoverRead, b: HoverRead): boolean {
  return (
    a.area === b.area &&
    a.inDelay === b.inDelay &&
    a.outDelay === b.outDelay &&
    a.out?.keyframes === b.out?.keyframes &&
    a.out?.duration === b.out?.duration
  );
}

/** The leave play lasts the item's duration unless `outDuration` or the config's hover.outDuration sets it. */
function readOut({ out, outDuration }: HoverMore, base: MoreBase): NonNullable<HoverRead["out"]> {
  if (typeof out !== "object" || out === null || Array.isArray(out)) {
    throw runtimeError("L2014");
  }
  const fallback = animateConfig().hover?.outDuration ?? base.duration;
  return { keyframes: out, duration: readMs(outDuration, fallback, "more outDuration") };
}
