import { runtimeError } from "../../errors.ts";
import { WHEN, isWhen, type When, type Source } from "../modes/trigger.ts";
import { DEFAULT_DETACH, readDetach, type DetachMore, type DetachRead } from "./detach-options.ts";
import { DEFAULT_HOVER, readHover, sameHover, type HoverMore, type HoverRead } from "./hover-options.ts";
import { DETACH_KEYS, HOVER_KEYS, keyList, SCROLL_KEYS, SPELLING_HINT, unknownKeyValues, VIEW_KEYS } from "./keys.ts";
import { DEFAULT_VIEW, readViewMore, sameView, type ViewMore, type ViewSettings } from "./view-options.ts";
import { DEFAULT_SCROLL, readScroll, sameScroll, type ScrollMore, type ScrollRead } from "./scroll-options.ts";

export type More = ViewMore | HoverMore | ScrollMore | DetachMore;

/** The item's own timing, used as the defaults for `more`. */
export interface MoreBase {
  duration: number;
}

// Fields a trigger does not use keep their defaults.
export interface ReadMore {
  view: ViewSettings;
  reverse: boolean;
  hover: HoverRead;
  scroll: ScrollRead;
  detach: DetachRead;
}

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

function whenName(when: When | Source): string {
  return isWhen(when) ? `WHEN.${String(when.description)}` : "a variable";
}

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
