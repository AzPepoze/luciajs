import { EDGE, SCROLL_AT, type ScrollAtMode, type ScrollEdge } from "./scroll-modes.ts";
import { runtimeError } from "../errors.ts";

/** The element's point `element` meets the window's point `window`. */
export interface ScrollTouch {
  element: ScrollEdge;
  window: ScrollEdge;
}

/** `start` and `end` of WHEN.SCROLL: the progress is 0 at `start` and 1 at `end`. */
export interface ScrollRange {
  start: ScrollTouch;
  end: ScrollTouch;
}

/** What a user can write for start or end. */
export type ScrollAt = ScrollAtMode | ScrollTouch;

const ENTER_TOUCH: ScrollTouch = Object.freeze({ element: EDGE.TOP, window: EDGE.BOTTOM });
const CENTER_TOUCH: ScrollTouch = Object.freeze({ element: EDGE.CENTER, window: EDGE.CENTER });
const LEAVE_TOUCH: ScrollTouch = Object.freeze({ element: EDGE.BOTTOM, window: EDGE.TOP });

const MODE_TOUCH: ReadonlyMap<unknown, ScrollTouch> = new Map<unknown, ScrollTouch>([
  [SCROLL_AT.ENTER, ENTER_TOUCH],
  [SCROLL_AT.CENTER, CENTER_TOUCH],
  [SCROLL_AT.LEAVE, LEAVE_TOUCH],
]);

export const DEFAULT_RANGE: ScrollRange = { start: ENTER_TOUCH, end: LEAVE_TOUCH };

const TOUCH_KEYS = ["element", "window"];

/** Turns a SCROLL_AT member or an { element, window } object into a touch, or throws. */
export function readScrollAt(value: unknown, name: "start" | "end"): ScrollTouch {
  const mode = MODE_TOUCH.get(value);
  if (mode !== undefined) return mode;
  if (typeof value === "number") throw runtimeError("L2047", { name });
  if (typeof value !== "object" || value === null) {
    throw runtimeError("L2017", { name, value: String(value) });
  }
  return readTouch(value, name);
}

function readTouch(value: object, name: string): ScrollTouch {
  for (const key of Object.keys(value)) {
    if (!TOUCH_KEYS.includes(key)) throw runtimeError("L2049", { name, key });
  }
  const { element, window } = value as Partial<ScrollTouch>;
  if (element === undefined || window === undefined) throw runtimeError("L2050", { name });
  return {
    element: readEdge(element, `${name}.element`),
    window: readEdge(window, `${name}.window`),
  };
}

function readEdge(value: unknown, name: string): ScrollEdge {
  if (typeof value === "number" && value >= 0 && value <= 1) return value;
  throw runtimeError("L2048", { name, value: String(value) });
}

export function sameTouch(a: ScrollTouch, b: ScrollTouch): boolean {
  return a.element === b.element && a.window === b.window;
}
