import { isReactive } from "../store/store.ts";
import type { AnimateItem } from "./animation.ts";
import type { Controller } from "./controller.ts";
import { readCurve, type Curve } from "./keyform.ts";
import type { Keyframes } from "./keyframes.ts";
import type { LoopSpec } from "./passes.ts";
import { ACTIVE, isActive, type Active, type Source } from "./trigger.ts";
import { readMore, type ReadMore } from "./more.ts";

export interface Timing {
  duration: number;
  delay: number;
  loop: LoopSpec | undefined;
  keep: boolean;
}

/** A checked item, ready to prepare and bind. */
export interface ItemOptions {
  keyframes: Keyframes;
  curve: Curve;
  timing: Timing;
  active: Active | Source;
  once: boolean;
  control: Controller | undefined;
  more: ReadMore;
}

const DEFAULT_DURATION = 300;

export function readItem(item: AnimateItem): ItemOptions {
  rejectOldAlternate(item);
  rejectMovedReverse(item);
  const active = readActive(item);
  rejectScrollLoop(item, active);
  const duration = readMs(item.duration, DEFAULT_DURATION, "duration");
  const curve = readCurve(item);
  const more = readMore(active, item.more, { duration, curve });
  return {
    keyframes: readKeyframes(item),
    curve,
    timing: {
      duration,
      delay: readMs(item.delay, 0, "delay"),
      loop: readLoop(item.loop, item.backAndForth),
      keep: item.keep !== false,
    },
    active,
    once: item.once ?? (active === ACTIVE.VIEW && !more.reverse),
    control: item.control,
    more,
  };
}

function readKeyframes(item: AnimateItem): Keyframes {
  if (!item.animation) throw new Error("animate item needs an animation, for example { animation: keyframes }");
  return item.animation;
}

function readActive({ active = ACTIVE.IN }: AnimateItem): Active | Source {
  if (isReactive(active) || isActive(active)) return active;
  throw new Error("animate active must be ACTIVE.IN, OUT, VIEW, HOVER or MANUAL, or a store");
}

function readMs(value: number | undefined, fallback: number, name: string): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value) || value < 0) throw new Error(`animate ${name} must be a time in ms, got ${String(value)}`);
  return value;
}

function rejectOldAlternate(item: AnimateItem): void {
  if ("alternate" in item) throw new Error("alternate was renamed to backAndForth");
}

/** A scroll-linked item follows the page position, so it has no time to loop over. */
function rejectScrollLoop(item: AnimateItem, active: Active | Source): void {
  if (active === ACTIVE.SCROLL && item.loop) throw new Error("loop does not work with ACTIVE.SCROLL");
}

function rejectMovedReverse(item: AnimateItem): void {
  if ("reverse" in item) throw new Error("reverse moved into more: { reverse: true }");
}

/** `loop: true` repeats forever; a number repeats that many times. Zero or missing means no loop. */
function readLoop(loop: boolean | number | undefined, backAndForth: boolean | undefined): LoopSpec | undefined {
  if (!loop) return undefined;
  const count = loop === true ? Infinity : loop;
  if (!(count >= 0)) throw new Error(`animate loop must be true or a count, got ${String(loop)}`);
  if (count === 0) return undefined;
  return { count, backAndForth: backAndForth === true };
}
