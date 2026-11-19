import type { Transition } from "./easing.ts";
import type { Controller } from "./controller.ts";
import type { Keyframes } from "./keyframes.ts";
import type { Ease } from "./modes.ts";
import type { Active, Source } from "./trigger.ts";
import type { More } from "./more.ts";

/** One animation on an element. Only `animation` is required; the rest have defaults. */
export interface AnimateItem {
  animation: Keyframes;
  transition?: Transition;
  ease?: Ease;
  active?: Active | Source;
  once?: boolean;
  more?: More;
  keep?: boolean;
  control?: Controller;
  duration?: number;
  delay?: number;
  loop?: boolean | number;
  backAndForth?: boolean;
}

export type Animate = Keyframes | AnimateItem | (Keyframes | AnimateItem)[];

const ITEM_KEYS = [
  "animation", "transition", "ease", "active", "once", "more", "keep", "control", "duration", "delay", "loop", "backAndForth",
  "reverse", // moved into more: listed so readItem can reject it with a clear error
  "alternate", // old name: listed so readItem can reject it with a clear error
] as const;

export function itemsOf(value: Animate): AnimateItem[] {
  const list = Array.isArray(value) ? value : [value];
  return list.map(toItem);
}

function toItem(value: Keyframes | AnimateItem): AnimateItem {
  return isItem(value) ? value : { animation: value };
}

/** Keyframes only have numeric keys, so any item key tells the two apart. */
function isItem(value: Keyframes | AnimateItem): value is AnimateItem {
  return ITEM_KEYS.some((key) => key in value);
}
