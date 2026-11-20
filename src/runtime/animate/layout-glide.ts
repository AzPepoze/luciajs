import { animateDefault } from "./defaults.ts";
import type { EaseStyle } from "./easing.ts";
import { readDefault, type DefaultEasing } from "./keyform.ts";
import { EASE, type Ease } from "./modes.ts";
import {
  copyBox,
  glideBox,
  newBox,
  newTransform,
  transformFor,
  type Box,
  type Origin,
  type Transform,
} from "./layout-box.ts";
import type { LayoutMode } from "./layout-mode.ts";

/** What a layout trigger needs to glide: its mode and the timing and easing from the item. */
export interface GlideSpec {
  mode: LayoutMode;
  duration: number;
  delay: number;
  /** The keyframes `default`, if any. The engine default fills the rest. */
  easing: DefaultEasing | undefined;
}

/** One element's glide. `view` is the visual box as the last frame showed it. */
export interface Glide {
  spec: GlideSpec;
  active: boolean;
  begin: number;
  easeStyle: EaseStyle;
  ease: Ease;
  view: Box;
  from: Box;
  to: Box;
  origin: Origin;
  /** The transform last written to the element. Identity when no glide runs. */
  current: Transform;
  visual: Box;
}

export function newGlide(spec: GlideSpec): Glide {
  return {
    spec,
    active: false,
    begin: 0,
    easeStyle: EASE.STYLE.QUART,
    ease: EASE.INOUT,
    view: newBox(),
    from: newBox(),
    to: newBox(),
    origin: { x: 0, y: 0 },
    current: newTransform(),
    visual: newBox(),
  };
}

/** Starts a glide from the visual box the element showed last. The easing is read here, so the engine default is current. */
export function startGlide(glide: Glide, now: number): void {
  const easing = readDefault(glide.spec.easing);
  const engine = animateDefault();
  glide.easeStyle = easing.easeStyle ?? engine.easeStyle;
  glide.ease = easing.ease ?? engine.ease;
  copyBox(glide.from, glide.view);
  glide.begin = now;
  glide.active = true;
}

/** Writes the glide at `now`. Returns false once it has ended, and then removes the transform it wrote. */
export function stepGlide(glide: Glide, el: HTMLElement, now: number): boolean {
  const { duration, delay, mode } = glide.spec;
  const elapsed = now - glide.begin - delay;
  const progress = duration > 0 ? Math.min(1, Math.max(0, elapsed / duration)) : 1;
  if (progress >= 1) {
    clearGlide(glide, el);
    return false;
  }
  const eased = glide.ease(glide.easeStyle, progress);
  glideBox(glide.from, glide.to, eased, mode, glide.visual);
  transformFor(glide.visual, glide.to, glide.origin, glide.current);
  el.style.setProperty("translate", `${glide.current.x}px ${glide.current.y}px`);
  if (mode.size) el.style.setProperty("scale", `${glide.current.sx} ${glide.current.sy}`);
  return true;
}

/** Removes the glide's transform, so the element sits at its layout box again. */
export function clearGlide(glide: Glide, el: HTMLElement): void {
  glide.active = false;
  glide.current.x = 0;
  glide.current.y = 0;
  glide.current.sx = 1;
  glide.current.sy = 1;
  el.style.removeProperty("translate");
  if (glide.spec.mode.size) el.style.removeProperty("scale");
}

/** Reads the transform origin in px. A percentage is taken of the box size. Falls back to the centre. */
export function readOrigin(el: HTMLElement, width: number, height: number, out: Origin): void {
  const [x = "", y = ""] = getComputedStyle(el).transformOrigin.split(" ");
  out.x = originPart(x, width);
  out.y = originPart(y, height);
}

function originPart(text: string, size: number): number {
  const value = parseFloat(text);
  if (Number.isNaN(value)) return size / 2;
  return text.endsWith("%") ? (value * size) / 100 : value;
}
