import { isReactive } from "../store/store.ts";
import type { AnimateItem } from "./animation.ts";
import type { Controller } from "./controller.ts";
import type { Keyframes } from "./keyframes.ts";
import type { LoopSpec } from "./passes.ts";
import { animateDefault } from "./defaults.ts";
import { readMidway, type MidwayOptions } from "./midway-options.ts";
import { WHEN, isWhen, type When, type Source } from "./trigger.ts";
import { readMore, type ReadMore } from "./more.ts";
import { runtimeError } from "../errors.ts";

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
}


export function readItem(item: AnimateItem): ItemOptions {
  rejectOldNames(item);
  rejectMovedReverse(item);
  const when = readWhen(item);
  rejectScrollLoop(item, when);
  const duration = readMs(item.duration, animateDefault().duration, "duration");
  const more = readMore(when, item.more, { duration });
  return {
    keyframes: readKeyframes(item),
    timing: {
      duration,
      delay: readMs(item.delay, 0, "delay"),
      loop: readLoop(item.loop, item.backAndForth),
      keep: item.keep !== false,
      midway: readMidway(item.midway),
    },
    when,
    once: item.once ?? (when === WHEN.VIEW && !more.reverse),
    control: item.control,
    more,
  };
}

function readKeyframes(item: AnimateItem): Keyframes {
  if (!item.style) throw runtimeError("L2001");
  return item.style;
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
  if (!Number.isFinite(value) || value < 0) throw runtimeError("L2003", { name, value: String(value) });
  return value;
}

function rejectOldNames(item: AnimateItem): void {
  if ("animation" in item) throw runtimeError("L2045");
  if ("active" in item) throw runtimeError("L2046");
  if ("ease" in item) throw runtimeError("L2005");
  if ("curve" in item || "transition" in item) throw runtimeError("L2006");
  if ("alternate" in item) throw runtimeError("L2007");
}

/** A scroll-linked item follows the page position, so it has no time to loop over. */
function rejectScrollLoop(item: AnimateItem, when: When | Source): void {
  if (when === WHEN.SCROLL && item.loop) throw runtimeError("L2009");
}

function rejectMovedReverse(item: AnimateItem): void {
  if ("reverse" in item) throw runtimeError("L2008");
}

/** `loop: true` repeats forever; a number repeats that many times. Zero or missing means no loop. */
function readLoop(loop: boolean | number | undefined, backAndForth: boolean | undefined): LoopSpec | undefined {
  if (!loop) return undefined;
  const count = loop === true ? Infinity : loop;
  if (!(count >= 0)) throw runtimeError("L2004", { value: String(loop) });
  if (count === 0) return undefined;
  return { count, backAndForth: backAndForth === true };
}
