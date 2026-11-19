import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { animate } from "@runtime/animate/bind.ts";
import type { AnimateItem } from "@runtime/animate/animation.ts";
import type { Keyframes } from "@runtime/animate/keyframes.ts";
import { EASE } from "@runtime/animate/modes.ts";
import { readMore as readWith } from "@runtime/animate/more.ts";

const readBase = { duration: 300 };
const readMore = (when: Parameters<typeof readWith>[0], more: Parameters<typeof readWith>[1]) => readWith(when, more, readBase);
import { WHEN } from "@runtime/animate/trigger.ts";
import { store } from "@runtime/store/store.ts";
import type { Leave } from "@runtime/dom/leave.ts";
import { advance, onReset, setReducedMotion, useFakeClock } from "./clock.ts";

useFakeClock();

const VIEWPORT_HEIGHT = 1000;
const fade: Keyframes = {
  0: [EASE.STYLE.LINEAR, EASE.IN, { opacity: 0 }],
  1: [EASE.STYLE.LINEAR, EASE.IN, { opacity: 1 }],
};

beforeEach(() => {
  Object.defineProperty(window, "innerHeight", { value: VIEWPORT_HEIGHT, configurable: true });
});
afterEach(() => setReducedMotion(false));

/** Mounts a scroll item on an element whose top edge sits at `top` px from the viewport top. */
function mount(item: Omit<AnimateItem, "style"> = {}, top = VIEWPORT_HEIGHT) {
  const el = document.createElement("div");
  let position = top;
  el.getBoundingClientRect = () => ({ top: position }) as DOMRect;
  const cleanups: Array<() => void> = [];
  const leaves: Leave[] = [];
  animate(el, () => ({ style: fade, when: WHEN.SCROLL, ...item }) as AnimateItem, cleanups, leaves);
  onReset(() => cleanups.forEach((cleanup) => cleanup()));
  return {
    el,
    cleanups,
    opacity: () => Number(el.style.opacity),
    /** Moves the element and scrolls, then runs the frame that follows. */
    scrollTo: (next: number) => {
      position = next;
      document.dispatchEvent(new Event("scroll"));
      advance(16);
    },
  };
}

describe("WHEN.SCROLL progress", () => {
  test("is 0 when the top is at the bottom edge and 1 at the top edge", () => {
    const { opacity, scrollTo } = mount();
    expect(opacity()).toBe(0);
    scrollTo(500);
    expect(opacity()).toBeCloseTo(0.5);
    scrollTo(0);
    expect(opacity()).toBe(1);
  });

  test("clamps below 0 and above 1", () => {
    const { opacity, scrollTo } = mount({}, 1200);
    expect(opacity()).toBe(0);
    scrollTo(-300);
    expect(opacity()).toBe(1);
  });

  test("custom start and end lines map the progress", () => {
    const { opacity, scrollTo } = mount({ more: { start: 0.2, end: 0.8 } }, 900);
    expect(opacity()).toBe(0);
    scrollTo(800);
    expect(opacity()).toBe(0);
    scrollTo(500);
    expect(opacity()).toBeCloseTo(0.5);
    scrollTo(200);
    expect(opacity()).toBe(1);
  });

  test("ignores time: no frames are needed beyond the scroll", () => {
    const { opacity, scrollTo } = mount();
    scrollTo(0);
    expect(opacity()).toBe(1);
    scrollTo(1000);
    expect(opacity()).toBe(0);
  });
});

describe("WHEN.SCROLL shared listener", () => {
  test("two items share one scroll listener, removed when the last one stops", () => {
    const add = spyOn(document, "addEventListener");
    const remove = spyOn(document, "removeEventListener");
    try {
      const a = mount();
      const b = mount();
      const scrollAdds = add.mock.calls.filter(([type]) => type === "scroll");
      expect(scrollAdds.length).toBe(1);
      for (const cleanup of a.cleanups) cleanup();
      expect(remove.mock.calls.some(([type]) => type === "scroll")).toBe(false);
      for (const cleanup of b.cleanups) cleanup();
      expect(remove.mock.calls.some(([type]) => type === "scroll")).toBe(true);
    } finally {
      add.mockRestore();
      remove.mockRestore();
    }
  });
});

describe("WHEN.SCROLL cleanup and reduced motion", () => {
  test("after cleanup, scrolling no longer moves the item", () => {
    const { cleanups, opacity, scrollTo } = mount();
    scrollTo(0);
    expect(opacity()).toBe(1);
    for (const cleanup of cleanups) cleanup();
    scrollTo(1000);
    expect(opacity()).toBe(1);
  });

  test("reduced motion shows the end state at once and does not listen", () => {
    setReducedMotion(true);
    const add = spyOn(document, "addEventListener");
    try {
      const { opacity } = mount({}, VIEWPORT_HEIGHT);
      expect(opacity()).toBe(1);
      expect(add.mock.calls.some(([type]) => type === "scroll")).toBe(false);
    } finally {
      add.mockRestore();
    }
  });
});

describe("WHEN.SCROLL errors", () => {
  test("loop is rejected", () => {
    const el = document.createElement("div");
    expect(() => animate(el, () => ({ style: fade, when: WHEN.SCROLL, loop: true }), [], [])).toThrow("loop does not work with WHEN.SCROLL");
  });

  test("start and end must differ", () => {
    expect(() => readMore(WHEN.SCROLL, { start: 0.5, end: 0.5 })).toThrow("start and end must be different lines");
  });

  test("start and end must be numbers", () => {
    expect(() => readMore(WHEN.SCROLL, { start: Number.NaN })).toThrow("start and end must be numbers");
  });

  test("keys other than start and end are rejected", () => {
    expect(() => readMore(WHEN.SCROLL, { outDelay: 10 } as never)).toThrow('more has an unknown key "outDelay", use start, end, follow or part');
  });
});

/** A tall or short element whose rect a test can move. */
function box(top: number, height: number) {
  const state = { top, height };
  const el = document.createElement("div");
  el.getBoundingClientRect = () => ({ top: state.top, height: state.height }) as DOMRect;
  return { el, state };
}

/** Mounts a follow item. The item's own element is not used for progress. */
function mountFollow(more: { part?: [number, number]; start?: number; end?: number } = {}) {
  const el = document.createElement("div");
  const follow = store<Element | null>(null);
  const cleanups: Array<() => void> = [];
  const leaves: Leave[] = [];
  animate(el, () => ({ style: fade, when: WHEN.SCROLL, more: { follow, ...more } }) as AnimateItem, cleanups, leaves);
  onReset(() => cleanups.forEach((cleanup) => cleanup()));
  return { el, follow, cleanups, opacity: () => Number(el.style.opacity) };
}

describe("WHEN.SCROLL follow", () => {
  test("a tall element: 0 when its top reaches the screen top, 1 when its bottom reaches the screen bottom", () => {
    const section = box(0, 2000);
    const { follow, opacity } = mountFollow();
    follow.value = section.el;
    advance(16);
    expect(opacity()).toBe(0);
    section.state.top = -500;
    document.dispatchEvent(new Event("scroll"));
    advance(16);
    expect(opacity()).toBeCloseTo(0.5);
    section.state.top = -1000;
    document.dispatchEvent(new Event("scroll"));
    advance(16);
    expect(opacity()).toBe(1);
  });

  test("an element shorter than the screen is 1 once its top has passed the screen top", () => {
    const short = box(100, 500);
    const { follow, opacity } = mountFollow();
    follow.value = short.el;
    advance(16);
    expect(opacity()).toBe(0);
    short.state.top = 0;
    document.dispatchEvent(new Event("scroll"));
    advance(16);
    expect(opacity()).toBe(1);
  });

  test("null means progress 0, and setting the store later moves the item", () => {
    const section = box(-1000, 2000);
    const { follow, opacity } = mountFollow();
    advance(16);
    expect(opacity()).toBe(0);
    follow.value = section.el;
    advance(16);
    expect(opacity()).toBe(1);
  });

  test("part slices the section progress and clamps outside it", () => {
    const section = box(0, 2000);
    const { follow, opacity } = mountFollow({ part: [0.5, 1] });
    follow.value = section.el;
    advance(16);
    section.state.top = -500;
    document.dispatchEvent(new Event("scroll"));
    advance(16);
    expect(opacity()).toBe(0);
    section.state.top = -750;
    document.dispatchEvent(new Event("scroll"));
    advance(16);
    expect(opacity()).toBeCloseTo(0.5);
    section.state.top = -1000;
    document.dispatchEvent(new Event("scroll"));
    advance(16);
    expect(opacity()).toBe(1);
  });

  test("items sharing one followed element measure it once per frame", () => {
    const section = box(0, 2000);
    let calls = 0;
    const measure = section.el.getBoundingClientRect;
    section.el.getBoundingClientRect = () => {
      calls++;
      return measure.call(section.el);
    };
    const a = mountFollow();
    const b = mountFollow();
    a.follow.value = section.el;
    b.follow.value = section.el;
    advance(16);
    calls = 0;
    section.state.top = -500;
    document.dispatchEvent(new Event("scroll"));
    advance(16);
    expect(calls).toBe(1);
    expect(a.opacity()).toBeCloseTo(0.5);
    expect(b.opacity()).toBeCloseTo(0.5);
  });

  test("reduced motion shows progress 1", () => {
    setReducedMotion(true);
    const { opacity } = mountFollow();
    expect(opacity()).toBe(1);
  });

  test("start and end with follow is an error", () => {
    expect(() => mountFollow({ start: 0.2 })).toThrow("start and end cannot be used with follow");
  });

  test("follow must be a store", () => {
    expect(() => readMore(WHEN.SCROLL, { follow: { value: null } } as never)).toThrow("follow must be a store");
  });
});

describe("WHEN.SCROLL part errors", () => {
  test.each([
    [[0.5, 0.2]],
    [[-0.1, 0.5]],
    [[0.2, 1.5]],
    [[0.5, 0.5]],
    [[0.1, 0.2, 0.3]],
  ])("%j is rejected", (part) => {
    expect(() => readMore(WHEN.SCROLL, { part } as never)).toThrow("part must be [from, to] with 0 <= from < to <= 1");
  });

  test("part must be an array", () => {
    expect(() => readMore(WHEN.SCROLL, { part: "abc" } as never)).toThrow("part must be [from, to]");
  });
});
