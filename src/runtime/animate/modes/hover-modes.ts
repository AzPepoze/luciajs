const FINAL: unique symbol = Symbol("FINAL");
const ELEMENT: unique symbol = Symbol("ELEMENT");

/** Where a hover is checked: the resting box of the element, or the box it is drawn in right now. */
export const HOVER_AREA = Object.freeze({ FINAL, ELEMENT } as const);

export type HoverArea = (typeof HOVER_AREA)[keyof typeof HOVER_AREA];
