import { isReactive } from "../variable/reactive.ts";
import type { AnimateItem } from "./animation.ts";
import type { Controller } from "./controller.ts";
import type { Keyframes } from "./keyframes.ts";
import type { LoopSpec } from "./passes.ts";
import { animateDefault } from "./defaults.ts";
import { readMidway, type MidwayOptions } from "./midway-options.ts";
import { WHEN, isLayoutWhen, isWhen, type When, type Source } from "./trigger.ts";
import { readMore, type ReadMore } from "./more.ts";
import type { ShrinkSpec } from "./shrink-closer.ts";
import { runtimeError } from "../errors.ts";
import { ITEM_KEYS, SPELLING_HINT, unknownKeyValues } from "./keys.ts";

export interface Timing {
  duration: number;
  delay: number;
  loop: LoopSpec | undefined;
  keep: boolean;
  midway: MidwayOptions;
}

/** A checked item, ready to prepare and bind. */
export interface ItemOptions {
  keyframes: Keyframes;
  timing: Timing;
  when: When | Source;
  once: boolean;
  control: Controller | undefined;
  more: ReadMore;
  /** Set for a DETACH item that closes the space it holds. Undefined with `keepSpace`. */
  shrink: ShrinkSpec | undefined;
}

export function readItem(item: AnimateItem): ItemOptions {
  rejectOldNames(item);
  rejectMovedReverse(item);
  rejectUnknownKeys(item);
  const when = readWhen(item);
  rejectLoop(item, when);
  const duration = readMs(item.duration, animateDefault().duration, "duration");
  const more = readMore(when, item.more, { duration });
  const keyframes = readKeyframes(item, when);
  const timing = {
    duration,
    delay: readMs(item.delay, 0, "delay"),
    loop: readLoop(item.loop, item.backAndForth),
    keep: item.keep !== false,
    midway: readMidway(item.midway),
  };
  return {
    keyframes,
    timing,
    shrink: readShrink(when, more, keyframes, timing),
    when,
    once: item.once ?? (when === WHEN.VIEW && !more.reverse),
    control: item.control,
    more,
  };
}

/** A DETACH item closes its space unless `keepSpace` is set. */
function readShrink(
  when: When | Source,
  more: ReadMore,
  keyframes: Keyframes,
  timing: Timing,
): ShrinkSpec | undefined {
  if (when !== WHEN.DETACH || more.detach.keepSpace) return undefined;
  return { duration: timing.duration, delay: timing.delay, keyframes };
}

/** The keyframes of a layout item with no style. It has no props, so only the glide and the timing run. */
const NO_STYLE: Keyframes = { 0: {}, 1: {} };

/** The styles the glide writes. A layout item cannot animate them, or its keyframes would fight the glide. */
const GLIDE_PROPS = ["translate", "scale"];

function readKeyframes(item: AnimateItem, when: When | Source): Keyframes {
  if (!item.style) {
    if (isLayoutWhen(when)) return NO_STYLE;
    throw runtimeError("L2001");
  }
  if (isLayoutWhen(when)) rejectGlideStyles(item.style);
  return item.style;
}

function rejectGlideStyles(keyframes: Keyframes): void {
  for (const [key, value] of Object.entries(keyframes)) {
    if (key === "default") continue;
    const style = (Array.isArray(value) ? value[value.length - 1] : value) as Record<
      string,
      unknown
    >;
    for (const name of GLIDE_PROPS) {
      if (name in style) throw runtimeError("L2052", { name });
    }
  }
}

/** A removed member such as WHEN.IN is undefined, so a `when` key with no value means an old name. */
function readWhen(item: AnimateItem): When | Source {
  if ("when" in item && item.when === undefined) throw runtimeError("L2044");
  const when = item.when ?? WHEN.ATTACH;
  if (isReactive(when) || isWhen(when)) return when;
  throw runtimeError(isRenamedWhen(when) ? "L2044" : "L2002");
}

function isRenamedWhen(value: unknown): boolean {
  if (typeof value === "symbol") return value.description === "IN" || value.description === "OUT";
  return value === "IN" || value === "OUT";
}

function readMs(value: number | undefined, fallback: number, name: string): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value) || value < 0)
    throw runtimeError("L2003", { name, value: String(value) });
  return value;
}

function rejectOldNames(item: AnimateItem): void {
  if ("animation" in item) throw runtimeError("L2045");
  if ("active" in item) throw runtimeError("L2046");
  if ("ease" in item) throw runtimeError("L2005");
  if ("curve" in item || "transition" in item) throw runtimeError("L2006");
  if ("alternate" in item) throw runtimeError("L2007");
}

/** A scroll-linked item follows the page position, and a glide plays once per change, so neither loops. */
function rejectLoop(item: AnimateItem, when: When | Source): void {
  if (!item.loop) return;
  if (when === WHEN.SCROLL) throw runtimeError("L2009");
  if (isLayoutWhen(when)) throw runtimeError("L2051");
}

/** Runs after the old names are rejected, so any key left that is not an item key is a typo. */
function rejectUnknownKeys(item: AnimateItem): void {
  for (const key of Object.keys(item)) {
    if (!ITEM_KEYS.includes(key)) {
      throw runtimeError("L2055", unknownKeyValues(key, ITEM_KEYS, SPELLING_HINT), key);
    }
  }
}

function rejectMovedReverse(item: AnimateItem): void {
  if ("reverse" in item) throw runtimeError("L2008");
}

/** `loop: true` repeats forever; a number repeats that many times. Zero or missing means no loop. */
function readLoop(
  loop: boolean | number | undefined,
  backAndForth: boolean | undefined,
): LoopSpec | undefined {
  if (!loop) return undefined;
  const count = loop === true ? Infinity : loop;
  if (!(count >= 0)) throw runtimeError("L2004", { value: String(loop) });
  if (count === 0) return undefined;
  return { count, backAndForth: backAndForth === true };
}
