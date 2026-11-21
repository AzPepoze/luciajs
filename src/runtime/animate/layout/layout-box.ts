import type { LayoutMode } from "../modes/layout-mode.ts";

/** A box in viewport pixels. Reused in place, so the frame loop allocates nothing. */
export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The translate a glide writes, in px. */
export interface Slide {
  x: number;
  y: number;
}

/** The padding and border around the content, so a written size lands on the measured box. */
export interface Edges {
  /** Along the inline axis, for `width`. */
  x: number;
  /** Along the block axis, for `height`. */
  y: number;
  /** True when `width` and `height` include them. */
  borderBox: boolean;
}

export function newBox(): Box {
  return { left: 0, top: 0, width: 0, height: 0 };
}

export function newSlide(): Slide {
  return { x: 0, y: 0 };
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

/** The translate that puts the visual box where the glide shows it, over the layout box `to`. */
export function slideFor(visual: Box, to: Box, out: Slide): void {
  out.x = visual.left - to.left;
  out.y = visual.top - to.top;
}

/** The layout box's viewport place, from the visual rect and the translate it currently has. */
export function layoutPlace(rect: Box, slide: Slide, out: Box): void {
  out.left = rect.left - slide.x;
  out.top = rect.top - slide.y;
}

/** Reads the padding and border around the content, and whether `width` and `height` include them. */
export function readEdges(el: HTMLElement, out: Edges): void {
  const style = getComputedStyle(el);
  out.borderBox = style.boxSizing === "border-box";
  out.x =
    px(style.paddingLeft) +
    px(style.paddingRight) +
    px(style.borderLeftWidth) +
    px(style.borderRightWidth);
  out.y =
    px(style.paddingTop) +
    px(style.paddingBottom) +
    px(style.borderTopWidth) +
    px(style.borderBottomWidth);
}

/** The `width` that renders a box `width` px wide. A content-box width leaves out the padding and border. */
export function cssWidth(edges: Edges, width: number): number {
  return edges.borderBox ? width : Math.max(0, width - edges.x);
}

/** The `height` that renders a box `height` px tall. A content-box height leaves out the padding and border. */
export function cssHeight(edges: Edges, height: number): number {
  return edges.borderBox ? height : Math.max(0, height - edges.y);
}

function lerp(from: number, to: number, e: number): number {
  return from + (to - from) * e;
}

function px(text: string): number {
  const value = parseFloat(text);
  return Number.isNaN(value) ? 0 : value;
}
