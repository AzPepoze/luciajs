import { EASE } from "lucia";

// Looping keyframes shared by the hero and the features section.
export const scrollHint = {
  default: [EASE.STYLE.SINE, EASE.INOUT],
  0: { translate: "0px 0px" },
  1: { translate: "0px 6px" },
};

export const logoBob = {
  default: [EASE.STYLE.SINE, EASE.INOUT],
  0: { translate: "0px 0px", rotate: "-3deg" },
  1: { translate: "0px -4px", rotate: "3deg" },
};
