import type { EaseStyle } from "../modes/easing.ts";
import { readDefault, type DefaultEasing } from "./keyform.ts";
import { EASE, type Ease } from "../modes/modes.ts";
import { runtimeError } from "../../errors.ts";

/** The engine default: used for a part when neither the key nor the keyframes `default` sets it. */
export interface AnimateDefault {
  easeStyle: EaseStyle;
  ease: Ease;
  duration: number;
}

/** What `setAnimateDefault` accepts. `ease` merges per part; `duration` replaces the value. */
export interface AnimateDefaultUpdate {
  ease?: DefaultEasing;
  duration?: number;
}

const UPDATE_KEYS = ["ease", "duration"];

let current: AnimateDefault = { easeStyle: EASE.STYLE.QUART, ease: EASE.INOUT, duration: 300 };

export function animateDefault(): AnimateDefault {
  return current;
}

/** Updates the engine default for the whole app. It is read at each play, so an update applies to every play after it. */
export function setAnimateDefault(update: AnimateDefaultUpdate): void {
  for (const key of Object.keys(update)) {
    if (!UPDATE_KEYS.includes(key)) throw runtimeError("L2030", { key });
  }
  const ease = readDefault(update.ease);
  current = {
    easeStyle: ease.easeStyle ?? current.easeStyle,
    ease: ease.ease ?? current.ease,
    duration: update.duration === undefined ? current.duration : readDuration(update.duration),
  };
}

function readDuration(duration: number): number {
  if (!Number.isFinite(duration) || duration < 0)
    throw runtimeError("L2031", { value: String(duration) });
  return duration;
}
