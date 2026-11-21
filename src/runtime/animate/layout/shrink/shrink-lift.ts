import type { Box } from "./shrink-movers.ts";

/** The inline styles a lift writes, so a cancel can put back the ones the element had. */
const LIFT_PROPS = [
  "position",
  "top",
  "left",
  "width",
  "height",
  "box-sizing",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "z-index",
];

type Saved = [name: string, value: string, priority: string];

export interface Lift {
  saved: Saved[];
}

/** Takes the element out of flow. Its place is set by `placeLift`. */
export function liftOut(el: HTMLElement): Lift {
  const saved = saveStyles(el);
  setStyles(el, {
    position: "absolute",
    top: `${el.offsetTop}px`,
    left: `${el.offsetLeft}px`,
    width: `${el.offsetWidth}px`,
    height: `${el.offsetHeight}px`,
    "box-sizing": "border-box",
    "margin-top": "0px",
    "margin-right": "0px",
    "margin-bottom": "0px",
    "margin-left": "0px",
    "z-index": "1",
  });
  return { saved };
}

/** Puts the lifted element at the screen place `wanted`, whatever its containing block is. */
export function placeLift(el: HTMLElement, wanted: Box): void {
  const origin = containerOrigin(el);
  el.style.top = `${wanted.top - origin.top}px`;
  el.style.left = `${wanted.left - origin.left}px`;
}

export function restoreLift(el: HTMLElement, lift: Lift): void {
  for (const [name, value, priority] of lift.saved) {
    if (value === "") el.style.removeProperty(name);
    else el.style.setProperty(name, value, priority);
  }
}

/** The screen place of the containing block's padding edge. A transformed ancestor also counts as one. */
function containerOrigin(el: HTMLElement): Box {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.position !== "static" || style.transform !== "none") {
      const rect = node.getBoundingClientRect();
      return { top: rect.top + node.clientTop, left: rect.left + node.clientLeft };
    }
  }
  return { top: -window.scrollY, left: -window.scrollX };
}

function saveStyles(el: HTMLElement): Saved[] {
  return LIFT_PROPS.map((name) => [
    name,
    el.style.getPropertyValue(name),
    el.style.getPropertyPriority(name),
  ]);
}

function setStyles(el: HTMLElement, styles: Record<string, string>): void {
  for (const name of Object.keys(styles)) el.style.setProperty(name, styles[name]!);
}
