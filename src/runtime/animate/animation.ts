import type { Controller } from "./controller.ts";
import type { Keyframes } from "./keyframes.ts";
import type { DetachMore, HoverMore, ScrollMore } from "./more.ts";
import type { AnimateMidway } from "./midway-options.ts";
import { WHEN, type LayoutWhen, type Source } from "./trigger.ts";
import type { ViewMore } from "./view-options.ts";
import { hasItemKey } from "./keys.ts";

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

/** A trigger with no options: ATTACH (the default), MANUAL, or a variable. */
interface PlainItem extends ItemBase {
  when?: typeof WHEN.ATTACH | typeof WHEN.MANUAL | Source;
  more?: never;
}

interface DetachItem extends ItemBase {
  when: typeof WHEN.DETACH;
  more?: DetachMore;
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
export type AnimateItem = PlainItem | DetachItem | LayoutItem | ViewItem | HoverItem | ScrollItem;

export type Animate = Keyframes | AnimateItem | (Keyframes | AnimateItem)[];

export function itemsOf(value: Animate): AnimateItem[] {
  const list = Array.isArray(value) ? value : [value];
  return list.map(toItem);
}

function toItem(value: Keyframes | AnimateItem): AnimateItem {
  return isItem(value) ? value : { style: value };
}

/** Keyframes only have numeric keys and `default`, so any item key tells the two apart. */
function isItem(value: Keyframes | AnimateItem): value is AnimateItem {
  return hasItemKey(Object.keys(value));
}
