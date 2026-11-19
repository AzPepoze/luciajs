import { EASE } from "./modes.ts";
import type { Keyframes } from "./keyframes.ts";

// Presets use the individual translate, scale and rotate properties, so they combine with an element's own transform.

const FADE: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { opacity: 0 },
  1: { opacity: 1 },
};

const SLIDE_UP: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { translate: "0px 24px", opacity: 0 },
  1: { translate: "0px 0px", opacity: 1 },
};

const SLIDE_DOWN: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { translate: "0px -24px", opacity: 0 },
  1: { translate: "0px 0px", opacity: 1 },
};

const SLIDE_LEFT: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { translate: "-24px 0px", opacity: 0 },
  1: { translate: "0px 0px", opacity: 1 },
};

const SLIDE_RIGHT: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { translate: "24px 0px", opacity: 0 },
  1: { translate: "0px 0px", opacity: 1 },
};

const POP: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { scale: "0.8", opacity: 0 },
  1: { scale: "1", opacity: 1 },
};

const ZOOM: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { scale: "0" },
  1: { scale: "1" },
};

const SHAKE: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { translate: "0px 0px" },
  0.2: { translate: "-10px 0px" },
  0.4: { translate: "10px 0px" },
  0.6: { translate: "-6px 0px" },
  0.8: { translate: "6px 0px" },
  1: { translate: "0px 0px" },
};

const PULSE: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { scale: "1" },
  0.5: { scale: "1.1" },
  1: { scale: "1" },
};

const SPIN: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { rotate: "0deg" },
  1: { rotate: "360deg" },
};

const FLIP: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { rotate: "y -90deg", opacity: 0 },
  1: { rotate: "y 0deg", opacity: 1 },
};

export const PRESET = Object.freeze({
  FADE,
  SLIDE_UP,
  SLIDE_DOWN,
  SLIDE_LEFT,
  SLIDE_RIGHT,
  POP,
  ZOOM,
  SHAKE,
  PULSE,
  SPIN,
  FLIP,
});
