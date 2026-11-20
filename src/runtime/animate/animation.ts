import type { Controller } from "./controller.ts";
import type { Keyframes } from "./keyframes.ts";
import type { HoverMore, ScrollMore } from "./more.ts";
import type { AnimateMidway } from "./midway-options.ts";
import { WHEN, type LayoutWhen, type Source } from "./trigger.ts";
import type { ViewMore } from "./view-options.ts";

interface ItemBase {
  style: Keyframes;
  control?: Controller;
  once?: boolean;
  keep?: boolean;
  midway?: AnimateMidway;
  duration?: number;
  delay?: number;
  loop?: boolean | number;
  backAndForth?: boolean;
}

/** A trigger with no options: ATTACH (the default), DETACH, MANUAL, or a store. */
interface PlainItem extends ItemBase {
  when?: typeof WHEN.ATTACH | typeof WHEN.DETACH | typeof WHEN.MANUAL | Source;
  more?: never;
}

/** A layout trigger glides the element. Its style is optional: the glide runs without it. */
interface LayoutItem extends Omit<ItemBase, "style"> {
  style?: Keyframes;
  when: LayoutWhen;
  more?: never;
}

interface ViewItem extends ItemBase {
  when: typeof WHEN.VIEW;
  more?: ViewMore;
}

interface HoverItem extends ItemBase {
  when: typeof WHEN.HOVER;
  more?: HoverMore;
}

interface ScrollItem extends ItemBase {
  when: typeof WHEN.SCROLL;
  more?: ScrollMore;
}

/** One animation on an element. `more` is typed by its trigger. Only `style` is required. */
export type AnimateItem = PlainItem | LayoutItem | ViewItem | HoverItem | ScrollItem;

export type Animate = Keyframes | AnimateItem | (Keyframes | AnimateItem)[];

const ITEM_KEYS = [
  "style",
  "when",
  "once",
  "more",
  "midway",
  "keep",
  "control",
  "duration",
  "delay",
  "loop",
  "backAndForth",
  "animation",
  "active", // old names: listed so readItem can reject them with a clear error
  "ease", // moved into the keyframes default: listed so readItem can reject it with a clear error
  "curve",
  "transition", // old names: listed so readItem can reject them with a clear error
  "reverse", // moved into more: listed so readItem can reject it with a clear error
  "alternate", // old name: listed so readItem can reject it with a clear error
] as const;

export function itemsOf(value: Animate): AnimateItem[] {
  const list = Array.isArray(value) ? value : [value];
  return list.map(toItem);
}

function toItem(value: Keyframes | AnimateItem): AnimateItem {
  return isItem(value) ? value : { style: value };
}

/** Keyframes only have numeric keys and `default`, so any item key tells the two apart. */
function isItem(value: Keyframes | AnimateItem): value is AnimateItem {
  return ITEM_KEYS.some((key) => key in value);
}
