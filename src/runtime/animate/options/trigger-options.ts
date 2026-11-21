import { runtimeError } from "../../errors.ts";
import { WHEN, isWhen, type When, type Source } from "../modes/trigger.ts";
import { readSpace, type SpaceMore, type SpaceRead } from "./space-options.ts";
import {
  hoverDefault,
  readHover,
  sameHover,
  type HoverMore,
  type HoverRead,
} from "./hover-options.ts";
import {
  HOVER_KEYS,
  keyList,
  SCROLL_KEYS,
  SPACE_KEYS,
  SPELLING_HINT,
  unknownKeyValues,
  VIEW_KEYS,
} from "./keys.ts";
import { readViewMore, sameView, type ViewMore, type ViewSettings } from "./view-options.ts";
import { readScroll, sameScroll, type ScrollMore, type ScrollRead } from "./scroll-options.ts";

export type More = ViewMore | HoverMore | ScrollMore | SpaceMore;

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
  space: SpaceRead;
}

/** The `more` of an item that sets none. Every field takes its config value, then its library default. */
function defaultMore(): ReadMore {
  return {
    ...readViewMore({}),
    hover: hoverDefault(),
    scroll: readScroll({}),
    space: readSpace({}),
  };
}

export function readMore(when: When | Source, more: More | undefined, base: MoreBase): ReadMore {
  if (more === undefined) return defaultMore();
  if (when === WHEN.VIEW)
    return { ...defaultMore(), ...readViewMore(checkKeys<ViewMore>(more, VIEW_KEYS)) };
  if (when === WHEN.HOVER)
    return { ...defaultMore(), hover: readHover(checkKeys<HoverMore>(more, HOVER_KEYS), base) };
  if (when === WHEN.SCROLL)
    return { ...defaultMore(), scroll: readScroll(checkKeys<ScrollMore>(more, SCROLL_KEYS)) };
  if (when === WHEN.ATTACH || when === WHEN.DETACH)
    return { ...defaultMore(), space: readSpace(checkKeys<SpaceMore>(more, SPACE_KEYS)) };
  throw runtimeError("L2010", { when: whenName(when) });
}

/** True when two items can share one trigger: the same settings for every field their trigger reads. */
export function sameMore(a: ReadMore, b: ReadMore): boolean {
  return (
    sameView(a.view, b.view) &&
    a.reverse === b.reverse &&
    sameHover(a.hover, b.hover) &&
    sameScroll(a.scroll, b.scroll) &&
    a.space.animateSpace === b.space.animateSpace
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
