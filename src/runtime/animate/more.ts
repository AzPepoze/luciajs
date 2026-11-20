import { isReactive } from "../variable/reactive.ts";
import type { ComputedVariable } from "../variable/compute.ts";
import type { Keyframes } from "./keyframes.ts";
import { WHEN, isWhen, type When, type Source } from "./trigger.ts";
import {
  DEFAULT_VIEW,
  readViewMore,
  sameView,
  type ViewMore,
  type ViewSettings,
} from "./view-options.ts";
import { runtimeError } from "../errors.ts";
import {
  DETACH_KEYS,
  HOVER_KEYS,
  keyList,
  SCROLL_KEYS,
  SPELLING_HINT,
  unknownKeyValues,
  VIEW_KEYS,
} from "./keys.ts";
import {
  DEFAULT_RANGE,
  readScrollAt,
  sameTouch,
  type ScrollAt,
  type ScrollRange,
} from "./scroll-touch.ts";

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

/** The `more` options of WHEN.DETACH. `keepSpace` keeps the space the element holds until it is removed. */
export interface DetachMore {
  keepSpace?: boolean;
}

/** The checked DETACH options. Without `keepSpace` the leave also closes the element's space. */
export interface DetachRead {
  keepSpace: boolean;
}

/** The item's own timing, used as the defaults for `more`. */
export interface MoreBase {
  duration: number;
}

/** The `more` options of WHEN.SCROLL. `start` and `end` say where the element meets the window. */
export interface ScrollMore {
  start?: ScrollAt;
  end?: ScrollAt;
  follow?: ComputedVariable<Element | null>;
  part?: [number, number];
}

export type More = ViewMore | HoverMore | ScrollMore | DetachMore;

export type Part = [number, number];

/**
 * The checked scroll options. `follow` is a variable of the element whose box is measured.
 * `pinned` is true when `follow` has no start or end: the tall element is then pinned to the screen.
 */
export interface ScrollRead {
  range: ScrollRange;
  part: Part;
  follow: ComputedVariable<Element | null> | undefined;
  pinned: boolean;
}

/** The `more` options of one item, checked for its trigger. Fields a trigger does not use keep their defaults. */
export interface ReadMore {
  view: ViewSettings;
  reverse: boolean;
  hover: HoverRead;
  scroll: ScrollRead;
  detach: DetachRead;
}

const DEFAULT_SCROLL: ScrollRead = {
  range: DEFAULT_RANGE,
  part: [0, 1],
  follow: undefined,
  pinned: false,
};
const DEFAULT_HOVER: HoverRead = { inDelay: 0, outDelay: 0, out: undefined };
const DEFAULT_DETACH: DetachRead = { keepSpace: false };
const DEFAULT_MORE: ReadMore = {
  view: DEFAULT_VIEW,
  reverse: false,
  hover: DEFAULT_HOVER,
  scroll: DEFAULT_SCROLL,
  detach: DEFAULT_DETACH,
};

export function readMore(when: When | Source, more: More | undefined, base: MoreBase): ReadMore {
  if (more === undefined) return DEFAULT_MORE;
  if (when === WHEN.VIEW)
    return { ...DEFAULT_MORE, ...readViewMore(checkKeys<ViewMore>(more, VIEW_KEYS)) };
  if (when === WHEN.HOVER)
    return { ...DEFAULT_MORE, hover: readHover(checkKeys<HoverMore>(more, HOVER_KEYS), base) };
  if (when === WHEN.SCROLL)
    return { ...DEFAULT_MORE, scroll: readScroll(checkKeys<ScrollMore>(more, SCROLL_KEYS)) };
  if (when === WHEN.DETACH)
    return { ...DEFAULT_MORE, detach: readDetach(checkKeys<DetachMore>(more, DETACH_KEYS)) };
  throw runtimeError("L2010", { when: whenName(when) });
}

/** True when two items can share one trigger: the same settings for every field their trigger reads. */
export function sameMore(a: ReadMore, b: ReadMore): boolean {
  return (
    sameView(a.view, b.view) &&
    a.reverse === b.reverse &&
    sameHover(a.hover, b.hover) &&
    sameScroll(a.scroll, b.scroll) &&
    a.detach.keepSpace === b.detach.keepSpace
  );
}

function sameHover(a: HoverRead, b: HoverRead): boolean {
  return (
    a.inDelay === b.inDelay &&
    a.outDelay === b.outDelay &&
    a.out?.keyframes === b.out?.keyframes &&
    a.out?.duration === b.out?.duration
  );
}

function sameScroll(a: ScrollRead, b: ScrollRead): boolean {
  return (
    sameTouch(a.range.start, b.range.start) &&
    sameTouch(a.range.end, b.range.end) &&
    a.part[0] === b.part[0] &&
    a.part[1] === b.part[1] &&
    a.follow === b.follow &&
    a.pinned === b.pinned
  );
}

function whenName(when: When | Source): string {
  return isWhen(when) ? `WHEN.${String(when.description)}` : "a variable";
}

/** Rejects a non-object or an unknown key, and returns the object typed as T. */
function checkKeys<T extends object>(more: More, allowed: readonly string[]): T {
  if (typeof more !== "object" || more === null) {
    throw runtimeError("L2011", { keys: keyList(allowed), value: String(more) });
  }
  for (const key of Object.keys(more)) {
    if (!allowed.includes(key)) {
      const values = unknownKeyValues(key, allowed, SPELLING_HINT);
      throw runtimeError("L2012", values, key);
    }
  }
  return more as T;
}

function readHover(more: HoverMore, base: MoreBase): HoverRead {
  if (more.out === undefined && more.outDuration !== undefined) throw runtimeError("L2013");
  return {
    inDelay: readMs(more.inDelay, "inDelay"),
    outDelay: readMs(more.outDelay, "outDelay"),
    out: more.out === undefined ? undefined : readOut(more, base),
  };
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

/**
 * With `follow` the progress reads the followed element's box. Without start and end it is pinned
 * to the screen; with them it runs like the item's own box. `part` does not combine with start and end.
 */
function readScroll({ start, end, follow, part }: ScrollMore): ScrollRead {
  if (follow === undefined) {
    return { range: readRange(start, end), part: readPart(part), follow: undefined, pinned: false };
  }
  if (!isReactive(follow)) throw runtimeError("L2016");
  const ranged = start !== undefined || end !== undefined;
  if (ranged && part !== undefined) throw runtimeError("L2015");
  const range = ranged ? readRange(start, end) : DEFAULT_RANGE;
  return { range, part: readPart(part), follow, pinned: !ranged };
}

function readDetach({ keepSpace }: DetachMore): DetachRead {
  if (keepSpace === undefined) return DEFAULT_DETACH;
  if (typeof keepSpace !== "boolean") throw runtimeError("L2056", { value: String(keepSpace) });
  return { keepSpace };
}

function readRange(start: unknown, end: unknown): ScrollRange {
  const range = {
    start: start === undefined ? DEFAULT_RANGE.start : readScrollAt(start, "start"),
    end: end === undefined ? DEFAULT_RANGE.end : readScrollAt(end, "end"),
  };
  if (sameTouch(range.start, range.end)) throw runtimeError("L2018");
  return range;
}

/** The slice of the section's progress that this item plays. `[0, 1]` means the whole section. */
function readPart(part: Part | undefined): Part {
  if (part === undefined) return [0, 1];
  if (!Array.isArray(part) || part.length !== 2) throw badPart(part);
  const [from, to] = part;
  if (!(from >= 0 && from < to && to <= 1)) throw badPart(part);
  return [from, to];
}

function badPart(part: unknown): Error {
  return runtimeError("L2019", { value: String(part) });
}
