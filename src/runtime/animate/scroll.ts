import type { Group } from "./group.ts";
import type { Part, ScrollRead } from "./more.ts";
import type { ScrollRange, ScrollTouch } from "./scroll-touch.ts";
import { unwrap, type ReadStore } from "../store/store.ts";
import { watch } from "../store/graph.ts";

interface Tracked {
  el: Element;
  group: Group;
  scroll: ScrollRead;
  followed: Element | null;
  stopFollow: (() => void) | undefined;
  last: number;
  next: number;
}

const tracked = new Set<Tracked>();
/** Section progress of each followed element, measured once per frame. */
const measured = new Map<Element, number>();
let scheduled = false;

/** Moves the group with the element's place on screen. One shared listener serves every scroll item. */
export function watchScroll(el: Element, group: Group, scroll: ScrollRead): () => void {
  const target: Tracked = {
    el,
    group,
    scroll,
    followed: null,
    stopFollow: undefined,
    last: NaN,
    next: NaN,
  };
  if (scroll.follow) target.stopFollow = followStore(target, scroll.follow);
  tracked.add(target);
  if (tracked.size === 1) startListening();
  schedule();
  return () => unwatch(target);
}

function followStore(target: Tracked, follow: ReadStore<Element | null>): () => void {
  return watch(() => {
    target.followed = unwrap(follow) as Element | null;
    schedule();
  });
}

function unwatch(target: Tracked): void {
  tracked.delete(target);
  target.stopFollow?.();
  if (tracked.size === 0) stopListening();
}

/** Capture on the document catches scrolling in any container, not only the window. */
const LISTEN_OPTIONS = { passive: true, capture: true };

function startListening(): void {
  document.addEventListener("scroll", schedule, LISTEN_OPTIONS);
  window.addEventListener("resize", schedule, LISTEN_OPTIONS);
}

function stopListening(): void {
  document.removeEventListener("scroll", schedule, LISTEN_OPTIONS);
  window.removeEventListener("resize", schedule, LISTEN_OPTIONS);
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(update);
}

/** Reads every position first, then writes only the progress that changed. */
function update(): void {
  scheduled = false;
  measured.clear();
  for (const target of tracked)
    target.next = partProgress(targetProgress(target), target.scroll.part);
  for (const target of tracked) {
    if (target.next === target.last) continue;
    target.last = target.next;
    target.group.show(target.next);
  }
}

function targetProgress(target: Tracked): number {
  if (target.scroll.follow) return followedProgress(target.followed);
  return scrollProgress(target.el, target.scroll.range);
}

function followedProgress(el: Element | null): number {
  if (el === null) return 0;
  const found = measured.get(el);
  if (found !== undefined) return found;
  const progress = pinnedProgress(el.getBoundingClientRect(), window.innerHeight);
  measured.set(el, progress);
  return progress;
}

/** 0 when the element meets the window at `start`, 1 when it meets it at `end`. Linear, clamped. */
export function scrollProgress(el: Element, range: ScrollRange): number {
  const rect = el.getBoundingClientRect();
  const viewport = window.innerHeight;
  const startTop = topWhenTouching(range.start, viewport, rect.height);
  const endTop = topWhenTouching(range.end, viewport, rect.height);
  const span = startTop - endTop;
  if (span === 0) return 0;
  return clamp01((startTop - rect.top) / span);
}

/** The element's top edge at the moment its touch point meets the window's touch point. */
function topWhenTouching(touch: ScrollTouch, viewport: number, height: number): number {
  return touch.window * viewport - touch.element * height;
}

/**
 * 0 when the top of a tall element reaches the top of the screen, 1 when its bottom reaches
 * the bottom. An element that fits on screen is 1 once its top has passed the top edge.
 */
export function pinnedProgress(rect: { top: number; height: number }, viewport: number): number {
  if (rect.height <= viewport) return rect.top <= 0 ? 1 : 0;
  return clamp01(-rect.top / (rect.height - viewport));
}

/** The slice `[from, to]` of the section progress, stretched to 0 to 1. */
export function partProgress(progress: number, [from, to]: Part): number {
  return clamp01((progress - from) / (to - from));
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
