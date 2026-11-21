import type { Space } from "./shrink-box.ts";

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
  placeholder: HTMLElement;
  saved: Saved[];
}

export function openSpace(el: HTMLElement, space: Space): Lift {
  const placeholder = makePlaceholder(space);
  const saved = saveStyles(el);
  el.before(placeholder);
  setStyles(el, {
    position: "absolute",
    top: `${space.top}px`,
    left: `${space.left}px`,
    width: `${space.width}px`,
    height: `${space.height}px`,
    "box-sizing": "border-box",
    "margin-top": "0px",
    "margin-right": "0px",
    "margin-bottom": "0px",
    "margin-left": "0px",
    "z-index": "1",
  });
  return { placeholder, saved };
}

export function removePlaceholder(lift: Lift): void {
  lift.placeholder.remove();
}

export function closeLift(el: HTMLElement, lift: Lift): void {
  removePlaceholder(lift);
  for (const [name, value, priority] of lift.saved) {
    if (value === "") el.style.removeProperty(name);
    else el.style.setProperty(name, value, priority);
  }
}

// Flex-basis is auto, so the closing size applies.
function makePlaceholder(space: Space): HTMLElement {
  const placeholder = document.createElement("div");
  placeholder.setAttribute("aria-hidden", "true");
  setStyles(placeholder, {
    ...space.placement,
    "box-sizing": "border-box",
    padding: "0px",
    border: "0px",
    visibility: "hidden",
    "pointer-events": "none",
    width: `${space.width}px`,
    height: `${space.height}px`,
    "margin-top": `${space.margin.top}px`,
    "margin-right": `${space.margin.right}px`,
    "margin-bottom": `${space.margin.bottom}px`,
    "margin-left": `${space.margin.left}px`,
    "flex-basis": "auto",
  });
  return placeholder;
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
