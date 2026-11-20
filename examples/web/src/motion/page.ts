import { WHEN, EASE, PRESET } from "lucia";

// Page transitions. The engine names are wrapped here, so a rename is a one-place change.
const pageOutKeys = {
  0: { opacity: 1, translate: "0px 0px" },
  1: [EASE.STYLE.QUART, EASE.IN, { opacity: 0, translate: "0px -12px" }],
};

export const pageIn = { style: PRESET.SLIDE_UP, when: WHEN.ATTACH, duration: 400 };
export const pageOut = { style: pageOutKeys, when: WHEN.DETACH, duration: 200 };
export const pageMotion = [pageIn, pageOut];
