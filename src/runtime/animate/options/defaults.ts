import type { EaseStyle } from "../modes/easing.ts";
import { readDefault, type DefaultEasing } from "./keyform.ts";
import { EASE, type Ease } from "../modes/modes.ts";
import { runtimeError } from "../../errors.ts";
import { animateConfig } from "./config-store.ts";

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

const LIBRARY_DEFAULT: AnimateDefault = {
  easeStyle: EASE.STYLE.QUART,
  ease: EASE.INOUT,
  duration: 300,
};

/** The runtime layer: only the parts that `setAnimateDefault` has set. */
let runtime: Partial<AnimateDefault> = {};

/** The runtime layer over the config layer over the library default. */
export function animateDefault(): AnimateDefault {
  const configured = configuredDefault();
  return {
    easeStyle: runtime.easeStyle ?? configured.easeStyle,
    ease: runtime.ease ?? configured.ease,
    duration: runtime.duration ?? configured.duration,
  };
}

/** Updates the engine default for the whole app. It is read at each play, so an update applies to every play after it. */
export function setAnimateDefault(update: AnimateDefaultUpdate): void {
  for (const key of Object.keys(update)) {
    if (!UPDATE_KEYS.includes(key)) throw runtimeError("L2030", { key });
  }
  const ease = readDefault(update.ease);
  runtime = {
    easeStyle: ease.easeStyle ?? runtime.easeStyle,
    ease: ease.ease ?? runtime.ease,
    duration: update.duration === undefined ? runtime.duration : readDuration(update.duration),
  };
}

/** Tests only: drops the runtime layer so the config and library values show again. */
export function clearAnimateDefault(): void {
  runtime = {};
}

/** The config layer over the library default. */
function configuredDefault(): AnimateDefault {
  const configured = animateConfig();
  const ease = readDefault(configured.ease);
  return {
    easeStyle: ease.easeStyle ?? LIBRARY_DEFAULT.easeStyle,
    ease: ease.ease ?? LIBRARY_DEFAULT.ease,
    duration: configured.duration ?? LIBRARY_DEFAULT.duration,
  };
}

function readDuration(duration: number): number {
  if (!Number.isFinite(duration) || duration < 0)
    throw runtimeError("L2031", { value: String(duration) });
  return duration;
}
