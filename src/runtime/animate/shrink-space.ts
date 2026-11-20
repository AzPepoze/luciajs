import type { Leave } from "../dom/leave.ts";
import { animateDefault } from "./defaults.ts";
import type { Group } from "./group.ts";
import { startPlaying, type Playable } from "./loop.ts";
import type { Keyframes } from "./keyframes.ts";
import { readDefault, readKey } from "./keyform.ts";
import type { Ease } from "./modes.ts";
import type { EaseStyle } from "./easing.ts";
import { prefersReducedMotion } from "./player.ts";

/** The timing and keyframes of a DETACH item, which the space closes with. */
export interface ShrinkSpec {
  duration: number;
  delay: number;
  keyframes: Keyframes;
}

/** A box value that closes to 0 along the layout axis. */
interface Track {
  property: string;
  from: number;
}

/** The size on the layout axis, and the sides that take space along it. */
interface Axis {
  size: string;
  cross: string;
  sides: readonly string[];
}

const COLUMN: Axis = {
  size: "height",
  cross: "width",
  sides: ["margin-top", "margin-bottom", "padding-top", "padding-bottom"],
};
const ROW: Axis = {
  size: "width",
  cross: "height",
  sides: ["margin-left", "margin-right", "padding-left", "padding-right"],
};

/**
 * A DETACH leave that also closes the space the element holds, so its siblings slide
 * to their new places while it leaves, instead of jumping when it is removed.
 */
export function detachLeave(el: HTMLElement, group: Group, spec: ShrinkSpec | undefined): Leave {
  if (spec === undefined) return () => group.forward();
  return () => Promise.all([group.forward(), shrinkSpace(el, spec)]).then(() => undefined);
}

/** Runs the close. The styles stay: the element is removed when the leave ends. */
function shrinkSpace(el: HTMLElement, spec: ShrinkSpec): Promise<void> {
  if (prefersReducedMotion()) return Promise.resolve();
  const shrink = new Shrink(el, spec, performance.now());
  return new Promise((resolve) => {
    shrink.done = resolve;
    startPlaying(shrink);
  });
}

/**
 * Reads happen when the leave starts, and writes wait for the first frame. A leave that
 * starts many elements at once then reads and writes in two passes, not one layout per element.
 */
class Shrink implements Playable {
  done: () => void = () => {};
  private readonly tracks: Track[];
  private readonly cross: string;
  private readonly crossSize: number;
  private readonly easeStyle: EaseStyle;
  private readonly ease: Ease;
  private pinned = false;

  constructor(
    private readonly el: HTMLElement,
    private readonly spec: ShrinkSpec,
    private readonly begin: number,
  ) {
    const axis = isRowItem(el) ? ROW : COLUMN;
    const computed = getComputedStyle(el);
    const size = { property: axis.size, from: sizeOf(el, axis.size) };
    this.tracks = [size, ...axis.sides.map((property) => sideOf(computed, property))];
    this.cross = axis.cross;
    this.crossSize = sizeOf(el, axis.cross);
    const [easeStyle, ease] = easingOf(spec.keyframes);
    this.easeStyle = easeStyle;
    this.ease = ease;
  }

  step(now: number): boolean {
    const { duration, delay } = this.spec;
    const elapsed = now - this.begin - delay;
    const progress = duration > 0 ? Math.min(1, Math.max(0, elapsed / duration)) : 1;
    const left = 1 - this.ease(this.easeStyle, progress);
    if (!this.pinned) this.pin();
    for (const track of this.tracks) {
      this.el.style.setProperty(track.property, `${track.from * left}px`);
    }
    if (progress < 1) return false;
    this.done();
    return true;
  }

  private pin(): void {
    this.pinned = true;
    pinBox(this.el, this.cross, this.crossSize);
  }
}

/** Border-box sizing and clipping keep the box at its measured size until the space closes. */
function pinBox(el: HTMLElement, cross: string, crossSize: number): void {
  el.style.boxSizing = "border-box";
  el.style.overflow = "clip";
  el.style.setProperty(cross, `${crossSize}px`);
}

function sideOf(computed: CSSStyleDeclaration, property: string): Track {
  return { property, from: parseFloat(computed.getPropertyValue(property)) || 0 };
}

function sizeOf(el: HTMLElement, property: string): number {
  return property === "width" ? el.offsetWidth : el.offsetHeight;
}

/** A flex item in a row flow closes its width. Anything else closes its height. */
function isRowItem(el: HTMLElement): boolean {
  const parent = el.parentElement;
  if (!parent) return false;
  const style = getComputedStyle(parent);
  return style.display.endsWith("flex") && style.flexDirection.startsWith("row");
}

/** The ease of the last key, which closes the space. */
function easingOf(keyframes: Keyframes): [EaseStyle, Ease] {
  const [easeStyle, ease] = readKey(
    keyframes[1]!,
    readDefault(keyframes.default),
    animateDefault(),
  );
  return [easeStyle, ease];
}
