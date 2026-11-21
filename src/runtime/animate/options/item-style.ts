import { runtimeError } from "@runtime/errors.ts";
import type { AnimateItem } from "../animation.ts";
import { isLayoutWhen, type Source, type When } from "../modes/trigger.ts";
import type { Keyframes } from "./keyframes.ts";

/** The keyframes of a layout item with no style. It has no props, so only the glide and the timing run. */
const NO_STYLE: Keyframes = { 0: {}, 1: {} };

/** The styles the glide writes. A layout item cannot animate them, or its keyframes would fight the glide. */
const GLIDE_PROPS = ["translate", "scale"];

export function readKeyframes(item: AnimateItem, when: When | Source): Keyframes {
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
