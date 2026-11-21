import { EASE } from "../modes/modes.ts";
import type { Keyframes, Style } from "./keyframes.ts";

// Presets set individual properties (translate, scale, rotate, opacity, filter), not transform, so they combine with an element's own transform.

const RESTED: Style = { translate: "0px 0px", opacity: 1 };

function inPreset(from: Style, to: Style): Keyframes {
  return { default: [EASE.STYLE.CUBIC, EASE.OUT], 0: from, 1: to };
}

function outPreset(from: Style, to: Style): Keyframes {
  return { default: [EASE.STYLE.CUBIC, EASE.IN], 0: from, 1: to };
}

function slideIn(start: string): Keyframes {
  return inPreset({ translate: start, opacity: 0 }, RESTED);
}

function slideOut(end: string): Keyframes {
  return outPreset(RESTED, { translate: end, opacity: 0 });
}

const FADE_IN = inPreset({ opacity: 0 }, { opacity: 1 });
const FADE_OUT = outPreset({ opacity: 1 }, { opacity: 0 });

const SLIDE_IN_UP = slideIn("0px 24px");
const SLIDE_IN_DOWN = slideIn("0px -24px");
const SLIDE_IN_LEFT = slideIn("-24px 0px");
const SLIDE_IN_RIGHT = slideIn("24px 0px");

const SLIDE_OUT_UP = slideOut("0px -24px");
const SLIDE_OUT_DOWN = slideOut("0px 24px");
const SLIDE_OUT_LEFT = slideOut("-24px 0px");
const SLIDE_OUT_RIGHT = slideOut("24px 0px");

const POP_IN = inPreset({ scale: "0.8", opacity: 0 }, { scale: "1", opacity: 1 });
const POP_OUT = outPreset({ scale: "1", opacity: 1 }, { scale: "0.8", opacity: 0 });

const ZOOM_IN = inPreset({ scale: "0" }, { scale: "1" });
const ZOOM_OUT = outPreset({ scale: "1" }, { scale: "0" });

const FLIP_IN = inPreset({ rotate: "y -90deg", opacity: 0 }, { rotate: "y 0deg", opacity: 1 });
const FLIP_OUT = outPreset({ rotate: "y 0deg", opacity: 1 }, { rotate: "y 90deg", opacity: 0 });

const BLUR_IN = inPreset({ filter: "blur(8px)", opacity: 0 }, { filter: "blur(0px)", opacity: 1 });
const BLUR_OUT = outPreset({ filter: "blur(0px)", opacity: 1 }, { filter: "blur(8px)", opacity: 0 });

const DROP_IN: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { translate: "0px -40px", opacity: 0 },
  0.6: { translate: "0px 6px", opacity: 1 },
  0.8: { translate: "0px -2px" },
  1: { translate: "0px 0px", opacity: 1 },
};

const BOUNCE_IN: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { scale: "0.3", opacity: 0 },
  0.5: { scale: "1.1", opacity: 1 },
  0.75: { scale: "0.95" },
  1: { scale: "1", opacity: 1 },
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

const WOBBLE: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { rotate: "0deg" },
  0.15: { rotate: "-5deg" },
  0.3: { rotate: "3deg" },
  0.45: { rotate: "-3deg" },
  0.6: { rotate: "2deg" },
  0.75: { rotate: "-1deg" },
  1: { rotate: "0deg" },
};

const HEARTBEAT: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { scale: "1" },
  0.14: { scale: "1.2" },
  0.28: { scale: "1" },
  0.42: { scale: "1.2" },
  0.7: { scale: "1" },
  1: { scale: "1" },
};

const TADA: Keyframes = {
  default: [EASE.STYLE.CUBIC, EASE.OUT],
  0: { scale: "1", rotate: "0deg" },
  0.1: { scale: "0.9", rotate: "-3deg" },
  0.3: { scale: "1.1", rotate: "3deg" },
  0.5: { scale: "1.1", rotate: "-3deg" },
  0.7: { scale: "1.1", rotate: "3deg" },
  0.9: { scale: "1.1", rotate: "-3deg" },
  1: { scale: "1", rotate: "0deg" },
};

export const PRESET = Object.freeze({
  FADE_IN,
  FADE_OUT,
  SLIDE_IN_UP,
  SLIDE_IN_DOWN,
  SLIDE_IN_LEFT,
  SLIDE_IN_RIGHT,
  SLIDE_OUT_UP,
  SLIDE_OUT_DOWN,
  SLIDE_OUT_LEFT,
  SLIDE_OUT_RIGHT,
  POP_IN,
  POP_OUT,
  ZOOM_IN,
  ZOOM_OUT,
  FLIP_IN,
  FLIP_OUT,
  BLUR_IN,
  BLUR_OUT,
  DROP_IN,
  BOUNCE_IN,
  SHAKE,
  PULSE,
  SPIN,
  WOBBLE,
  HEARTBEAT,
  TADA,
});
