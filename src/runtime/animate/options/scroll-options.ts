import { runtimeError } from "@runtime/errors.ts";
import type { ComputedVariable } from "@runtime/variable/compute.ts";
import { isReactive } from "@runtime/variable/reactive.ts";
import {
  DEFAULT_RANGE,
  readScrollAt,
  sameTouch,
  type ScrollAt,
  type ScrollRange,
} from "../scroll/scroll-touch.ts";

/** The `more` options of WHEN.SCROLL. `start` and `end` say where the element meets the window. */
export interface ScrollMore {
  start?: ScrollAt;
  end?: ScrollAt;
  follow?: ComputedVariable<Element | null>;
  part?: [number, number];
}

export type Part = [number, number];

/**
 * The checked scroll options. `follow` is a variable of the element whose box is measured.
 * `pinned` is true when `follow` has no start or end: the tall element is then pinned to the screen.
 */
export interface ScrollRead {
  range: ScrollRange;
  part: Part;
  follow: ComputedVariable<Element | null> | undefined;
  pinned: boolean;
}

export const DEFAULT_SCROLL: ScrollRead = {
  range: DEFAULT_RANGE,
  part: [0, 1],
  follow: undefined,
  pinned: false,
};

export function sameScroll(a: ScrollRead, b: ScrollRead): boolean {
  return (
    sameTouch(a.range.start, b.range.start) &&
    sameTouch(a.range.end, b.range.end) &&
    a.part[0] === b.part[0] &&
    a.part[1] === b.part[1] &&
    a.follow === b.follow &&
    a.pinned === b.pinned
  );
}

/**
 * With `follow` the progress reads the followed element's box. Without start and end it is pinned
 * to the screen; with them it runs like the item's own box. `part` does not combine with start and end.
 */
export function readScroll({ start, end, follow, part }: ScrollMore): ScrollRead {
  if (follow === undefined) {
    return { range: readRange(start, end), part: readPart(part), follow: undefined, pinned: false };
  }
  if (!isReactive(follow)) throw runtimeError("L2016");
  const ranged = start !== undefined || end !== undefined;
  if (ranged && part !== undefined) throw runtimeError("L2015");
  const range = ranged ? readRange(start, end) : DEFAULT_RANGE;
  return { range, part: readPart(part), follow, pinned: !ranged };
}

function readRange(start: unknown, end: unknown): ScrollRange {
  const range = {
    start: start === undefined ? DEFAULT_RANGE.start : readScrollAt(start, "start"),
    end: end === undefined ? DEFAULT_RANGE.end : readScrollAt(end, "end"),
  };
  if (sameTouch(range.start, range.end)) throw runtimeError("L2018");
  return range;
}

/** The slice of the section's progress that this item plays. `[0, 1]` means the whole section. */
function readPart(part: Part | undefined): Part {
  if (part === undefined) return [0, 1];
  if (!Array.isArray(part) || part.length !== 2) throw badPart(part);
  const [from, to] = part;
  if (!(from >= 0 && from < to && to <= 1)) throw badPart(part);
  return [from, to];
}

function badPart(part: unknown): Error {
  return runtimeError("L2019", { value: String(part) });
}
