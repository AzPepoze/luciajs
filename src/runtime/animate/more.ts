import { isReactive } from "../store/store.ts";
import type { ReadStore } from "../store/store.ts";
import type { Curve } from "./keyform.ts";
import type { Keyframes } from "./keyframes.ts";
import { ACTIVE, isActive, type Active, type Source } from "./trigger.ts";
import { DEFAULT_VIEW, readViewMore, sameView, type ViewMore, type ViewSettings } from "./view-options.ts";

/** The `more` options of ACTIVE.HOVER. Times are in ms. `out` replaces the play back for leaving. */
export interface HoverMore {
  inDelay?: number;
  outDelay?: number;
  out?: Keyframes;
  outDuration?: number;
}

/** The checked HOVER options. `out` is the keyframes for leaving, with its curve and duration. */
export interface HoverRead {
  inDelay: number;
  outDelay: number;
  out: { keyframes: Keyframes; curve: Curve; duration: number } | undefined;
}

/** The item's own timing, used as the defaults for `more`. */
export interface MoreBase {
  duration: number;
  curve: Curve;
}

/** The `more` options of ACTIVE.SCROLL. Lines are fractions of the viewport height, from the bottom edge. */
export interface ScrollMore {
  start?: number;
  end?: number;
  follow?: ReadStore<Element | null>;
  part?: [number, number];
}

export type More = ViewMore | HoverMore | ScrollMore;

export interface ScrollRange {
  start: number;
  end: number;
}

export type Part = [number, number];

/** The checked scroll options. `follow` is a store of the element that drives the progress. */
export interface ScrollRead {
  range: ScrollRange;
  part: Part;
  follow: ReadStore<Element | null> | undefined;
}

/** The `more` options of one item, checked for its trigger. Fields a trigger does not use keep their defaults. */
export interface ReadMore {
  view: ViewSettings;
  reverse: boolean;
  hover: HoverRead;
  scroll: ScrollRead;
}

const DEFAULT_SCROLL: ScrollRead = { range: { start: 0, end: 1 }, part: [0, 1], follow: undefined };
const DEFAULT_HOVER: HoverRead = { inDelay: 0, outDelay: 0, out: undefined };
const DEFAULT_MORE: ReadMore = { view: DEFAULT_VIEW, reverse: false, hover: DEFAULT_HOVER, scroll: DEFAULT_SCROLL };

const VIEW_KEYS = ["margin", "amount", "reverse"];
const HOVER_KEYS = ["inDelay", "outDelay", "out", "outDuration"];
const SCROLL_KEYS = ["start", "end", "follow", "part"];

export function readMore(active: Active | Source, more: More | undefined, base: MoreBase): ReadMore {
  if (more === undefined) return DEFAULT_MORE;
  if (active === ACTIVE.VIEW) return { ...DEFAULT_MORE, ...readViewMore(checkKeys<ViewMore>(more, VIEW_KEYS)) };
  if (active === ACTIVE.HOVER) return { ...DEFAULT_MORE, hover: readHover(checkKeys<HoverMore>(more, HOVER_KEYS), base) };
  if (active === ACTIVE.SCROLL) return { ...DEFAULT_MORE, scroll: readScroll(checkKeys<ScrollMore>(more, SCROLL_KEYS)) };
  throw new Error(`more is not used with ${activeName(active)}`);
}

/** True when two items can share one trigger: the same settings for every field their trigger reads. */
export function sameMore(a: ReadMore, b: ReadMore): boolean {
  return sameView(a.view, b.view) && a.reverse === b.reverse && sameHover(a.hover, b.hover) && sameScroll(a.scroll, b.scroll);
}

function sameHover(a: HoverRead, b: HoverRead): boolean {
  return a.inDelay === b.inDelay && a.outDelay === b.outDelay && a.out?.keyframes === b.out?.keyframes && a.out?.duration === b.out?.duration;
}

function sameScroll(a: ScrollRead, b: ScrollRead): boolean {
  return (
    a.range.start === b.range.start &&
    a.range.end === b.range.end &&
    a.part[0] === b.part[0] &&
    a.part[1] === b.part[1] &&
    a.follow === b.follow
  );
}

function activeName(active: Active | Source): string {
  return isActive(active) ? `ACTIVE.${String(active.description)}` : "a store";
}

/** Rejects a non-object or an unknown key, and returns the object typed as T. */
function checkKeys<T extends object>(more: More, allowed: string[]): T {
  if (typeof more !== "object" || more === null) {
    throw new Error(`animate more must be an object with ${orList(allowed)}, got ${String(more)}`);
  }
  for (const key of Object.keys(more)) {
    if (!allowed.includes(key)) throw new Error(`more has an unknown key "${key}", use ${orList(allowed)}`);
  }
  return more as T;
}

function orList(words: string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} or ${words[words.length - 1]}`;
}

function readHover(more: HoverMore, base: MoreBase): HoverRead {
  if (more.out === undefined && more.outDuration !== undefined) throw new Error("animate more outDuration needs out");
  return {
    inDelay: readMs(more.inDelay, "inDelay"),
    outDelay: readMs(more.outDelay, "outDelay"),
    out: more.out === undefined ? undefined : readOut(more, base),
  };
}

function readOut({ out, outDuration }: HoverMore, base: MoreBase): NonNullable<HoverRead["out"]> {
  if (typeof out !== "object" || out === null || Array.isArray(out)) {
    throw new Error("animate more out must be keyframes, such as { 0: { opacity: 1 }, 1: { opacity: 0 } }");
  }
  return { keyframes: out, curve: base.curve, duration: readMs(outDuration, "outDuration", base.duration) };
}

function readMs(value: number | undefined, name: string, fallback = 0): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value) || value < 0) throw new Error(`animate more ${name} must be a time in ms, got ${String(value)}`);
  return value;
}

/** With `follow` the element drives the progress, so start and end do not apply. */
function readScroll({ start, end, follow, part }: ScrollMore): ScrollRead {
  if (follow === undefined) {
    return { range: readRange(start ?? 0, end ?? 1), part: readPart(part), follow: undefined };
  }
  if (start !== undefined || end !== undefined) throw new Error("animate more start and end cannot be used with follow");
  if (!isReactive(follow)) throw new Error("animate more follow must be a store that holds an element, such as one set by bind-element");
  return { range: DEFAULT_SCROLL.range, part: readPart(part), follow };
}

function readRange(start: number, end: number): ScrollRange {
  if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error(`animate more start and end must be numbers, got ${String(start)} and ${String(end)}`);
  if (start === end) throw new Error("animate more start and end must be different lines");
  return { start, end };
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
  return new Error(`animate more part must be [from, to] with 0 <= from < to <= 1, got ${String(part)}`);
}
