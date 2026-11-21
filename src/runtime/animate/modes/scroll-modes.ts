const ENTER: unique symbol = Symbol("ENTER");
const CENTER: unique symbol = Symbol("CENTER");
const LEAVE: unique symbol = Symbol("LEAVE");

/** Where the element meets the window: its top at the bottom, its centre at the centre, its bottom at the top. */
export const SCROLL_AT = Object.freeze({ ENTER, CENTER, LEAVE } as const);

export type ScrollAtMode = (typeof SCROLL_AT)[keyof typeof SCROLL_AT];

/** A point on an element or the window, as a fraction of its height: 0 is the top, 1 the bottom. */
export const EDGE = Object.freeze({ TOP: 0, CENTER: 0.5, BOTTOM: 1 } as const);

export type ScrollEdge = number;
