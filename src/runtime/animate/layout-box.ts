import type { LayoutMode } from "./layout-mode.ts";

/** A box in viewport pixels. Reused in place, so the frame loop allocates nothing. */
export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The transform a glide writes: a translate in px, and a scale per axis. */
export interface Transform {
  x: number;
  y: number;
  sx: number;
  sy: number;
}

/** The transform origin in px, from the element's top-left corner. */
export interface Origin {
  x: number;
  y: number;
}

export function newBox(): Box {
  return { left: 0, top: 0, width: 0, height: 0 };
}

export function newTransform(): Transform {
  return { x: 0, y: 0, sx: 1, sy: 1 };
}

export function copyBox(to: Box, from: Box): void {
  to.left = from.left;
  to.top = from.top;
  to.width = from.width;
  to.height = from.height;
}

/** The visual box at eased progress `e`. A trigger that does not follow place keeps the new place, and one that does not follow size keeps the new size. */
export function glideBox(from: Box, to: Box, e: number, mode: LayoutMode, out: Box): void {
  out.left = mode.place ? lerp(from.left, to.left, e) : to.left;
  out.top = mode.place ? lerp(from.top, to.top, e) : to.top;
  out.width = mode.size ? lerp(from.width, to.width, e) : to.width;
  out.height = mode.size ? lerp(from.height, to.height, e) : to.height;
}

/**
 * The transform that puts the layout box `to` at the visual box `visual`. The element scales
 * about its origin, so the translate also cancels the origin's shift under the scale.
 */
export function transformFor(visual: Box, to: Box, origin: Origin, out: Transform): void {
  out.sx = to.width > 0 ? visual.width / to.width : 1;
  out.sy = to.height > 0 ? visual.height / to.height : 1;
  out.x = visual.left - to.left - origin.x * (1 - out.sx);
  out.y = visual.top - to.top - origin.y * (1 - out.sy);
}

/** The layout box's viewport place, from the visual rect and the transform it currently has. */
export function layoutPlace(rect: Box, current: Transform, origin: Origin, out: Box): void {
  out.left = rect.left - current.x - origin.x * (1 - current.sx);
  out.top = rect.top - current.y - origin.y * (1 - current.sy);
}

function lerp(from: number, to: number, e: number): number {
  return from + (to - from) * e;
}
