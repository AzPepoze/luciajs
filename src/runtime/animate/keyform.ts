import { TRANSITION, type Transition } from "./easing.ts";
import type { Keyframe, KeyframeValue, Style } from "./keyframes.ts";
import { EASE, isEase, type Ease } from "./modes.ts";

/** The transition and ease that keys use unless they set their own. */
export interface Curve {
  transition: Transition;
  ease: Ease;
}

export const DEFAULT_CURVE: Curve = Object.freeze({ transition: TRANSITION.CUBIC, ease: EASE.OUT });

const KEY_FORM = "animate key must be a style object, [transition, ease, style], [transition, style] or [ease, style]";

/** Reads an item's `transition` and `ease`. Missing ones take the library defaults. */
export function readCurve({ transition, ease }: { transition?: Transition; ease?: Ease }): Curve {
  return {
    transition: transition === undefined ? DEFAULT_CURVE.transition : checkTransition(transition),
    ease: ease === undefined ? DEFAULT_CURVE.ease : checkEase(ease),
  };
}

/** Turns one key value into a full keyframe. Keys that set no curve use the item's curve. */
export function readKey(value: KeyframeValue, curve: Curve): Keyframe {
  if (!Array.isArray(value)) return [curve.transition, curve.ease, checkStyle(value)];
  if (value.length === 3) return [checkTransition(value[0]), checkEase(value[1]), checkStyle(value[2])];
  if (value.length === 2) return readPair(value, curve);
  throw new Error(KEY_FORM);
}

/** An EASE member in the first slot means `[ease, style]`; anything else is a transition. */
function readPair([first, style]: [Transition | Ease, Style], curve: Curve): Keyframe {
  if (isEase(first)) return [curve.transition, first, checkStyle(style)];
  return [checkTransition(first), curve.ease, checkStyle(style)];
}

function checkStyle(value: unknown): Style {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(KEY_FORM);
  return value as Style;
}

function checkTransition(value: unknown): Transition {
  if (typeof value !== "function" || isEase(value)) {
    throw new Error("animate transition must be a function of t, such as TRANSITION.QUART");
  }
  return value as Transition;
}

function checkEase(value: unknown): Ease {
  if (!isEase(value)) throw new Error("animate ease must be EASE.IN, EASE.OUT or EASE.INOUT");
  return value;
}
