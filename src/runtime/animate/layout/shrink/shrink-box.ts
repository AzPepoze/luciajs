/** The layout axis of a leave: the size, the two sides on it, and the parent gap that sits between items. */
export interface Axis {
  size: "width" | "height";
  start: "left" | "top";
  end: "right" | "bottom";
  gap: "column-gap" | "row-gap";
}

const ROW: Axis = { size: "width", start: "left", end: "right", gap: "column-gap" };
const COLUMN: Axis = { size: "height", start: "top", end: "bottom", gap: "row-gap" };

export interface Sides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * The box of a leaving element as layout placed it. Read once, when the leave starts, so the
 * frame that writes the placeholder reads nothing.
 */
export interface Space {
  axis: Axis;
  /** The size on the layout axis. */
  along: number;
  /** Offsets from the offsetParent's padding edge. These skip the element's own transform. */
  top: number;
  left: number;
  width: number;
  height: number;
  margin: Sides;
  gap: number;
  /** The display and the flex and grid placement the placeholder copies, so it takes the same cell. */
  placement: Record<string, string>;
}

const PLACEMENT_PROPS = [
  "flex-grow",
  "flex-shrink",
  "align-self",
  "justify-self",
  "order",
  "grid-row-start",
  "grid-row-end",
  "grid-column-start",
  "grid-column-end",
];

/**
 * Reads the box of an in-flow element. Returns undefined when nothing closes: no parent, an inline,
 * contents or hidden box, or a positioned box, which takes no space along the flow.
 */
export function readSpace(el: HTMLElement): Space | undefined {
  const parent = el.parentElement;
  if (parent === null) return undefined;
  const style = getComputedStyle(el);
  if (!isFlowBox(style)) return undefined;
  const parentStyle = getComputedStyle(parent);
  const axis = isRowItem(parentStyle) ? ROW : COLUMN;
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  return {
    axis,
    along: axis.size === "width" ? width : height,
    top: el.offsetTop,
    left: el.offsetLeft,
    width,
    height,
    margin: {
      top: pixels(style.marginTop),
      right: pixels(style.marginRight),
      bottom: pixels(style.marginBottom),
      left: pixels(style.marginLeft),
    },
    gap: pixels(parentStyle.getPropertyValue(axis.gap)),
    placement: placementOf(style),
  };
}

function isFlowBox(style: CSSStyleDeclaration): boolean {
  const { display, position } = style;
  const box = display !== "inline" && display !== "contents" && display !== "none";
  return box && (position === "static" || position === "relative" || position === "sticky");
}

function placementOf(style: CSSStyleDeclaration): Record<string, string> {
  const placement: Record<string, string> = {
    display: style.display.startsWith("inline") ? "inline-block" : "block",
  };
  for (const name of PLACEMENT_PROPS) placement[name] = style.getPropertyValue(name);
  return placement;
}

/** A flex item in a row flow lays out along the width. Anything else lays out along the height. */
function isRowItem(style: CSSStyleDeclaration): boolean {
  return style.display.endsWith("flex") && style.flexDirection.startsWith("row");
}

function pixels(value: string): number {
  return parseFloat(value) || 0;
}
