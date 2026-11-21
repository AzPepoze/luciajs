import { runtimeError } from "../../errors.ts";
import type { AnimateItem } from "../animation.ts";
import { isLayoutWhen, WHEN, type Source, type When } from "../modes/trigger.ts";
import type { Keyframes } from "./keyframes.ts";
import { PRESET } from "./presets.ts";
import { animateConfig } from "./config-store.ts";

/** The keyframes of a layout item with no style. It has no props, so only the glide and the timing run. */
const NO_STYLE: Keyframes = { 0: {}, 1: {} };

/** The styles the glide writes. A layout item cannot animate them, or its keyframes would fight the glide. */
const GLIDE_PROPS = ["translate", "scale"];

export function readKeyframes(item: AnimateItem, when: When | Source): Keyframes {
  if (!item.style) return keyframesWithoutStyle(when);
  if (isLayoutWhen(when)) rejectGlideStyles(item.style);
  return item.style;
}

/** An item with no style takes the config preset: `out` for DETACH, `in` for the other triggers. */
function keyframesWithoutStyle(when: When | Source): Keyframes {
  if (isLayoutWhen(when)) return NO_STYLE;
  const name = when === WHEN.DETACH ? animateConfig().out : animateConfig().in;
  if (name === undefined) throw runtimeError("L2001");
  return PRESET[name];
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
