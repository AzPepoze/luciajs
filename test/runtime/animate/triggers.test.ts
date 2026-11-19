import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { animate } from "@runtime/animate/bind.ts";
import type { AnimateItem } from "@runtime/animate/animation.ts";
import { TRANSITION } from "@runtime/animate/easing.ts";
import type { Keyframes } from "@runtime/animate/keyframes.ts";
import { EASE } from "@runtime/animate/modes.ts";
import { ACTIVE } from "@runtime/animate/trigger.ts";
import { store } from "@runtime/store/store.ts";
import type { Leave } from "@runtime/dom/leave.ts";
import { advance, onReset, useFakeClock } from "./clock.ts";

useFakeClock();

const fade: Keyframes = {
  0: [TRANSITION.LINEAR, EASE.IN, { opacity: 0 }],
  1: [TRANSITION.LINEAR, EASE.IN, { opacity: 1 }],
};

/** Records what the element observes, and lets a test say when it enters or leaves view. */
class FakeIntersectionObserver {
  static current: FakeIntersectionObserver | undefined;
  static unobserved: Element[] = [];
  readonly targets = new Set<Element>();

  constructor(
    private readonly onEntries: (entries: IntersectionObserverEntry[]) => void,
    readonly options: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.current = this;
  }

  observe(el: Element): void {
    this.targets.add(el);
  }

  unobserve(el: Element): void {
    this.targets.delete(el);
    FakeIntersectionObserver.unobserved.push(el);
  }

  disconnect(): void {
    this.targets.clear();
  }

  report(el: Element, ratio: number): void {
    this.onEntries([{ target: el, intersectionRatio: ratio, isIntersecting: ratio > 0 } as IntersectionObserverEntry]);
  }
}

const realIntersectionObserver = globalThis.IntersectionObserver;
beforeAll(() => {
  globalThis.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;
});
afterAll(() => {
  globalThis.IntersectionObserver = realIntersectionObserver;
});

function mount(item: Omit<AnimateItem, "animation"> = {}) {
  const el = document.createElement("div");
  const cleanups: Array<() => void> = [];
  const leaves: Leave[] = [];
  animate(el, () => ({ animation: fade, duration: 100, ...item }), cleanups, leaves);
  onReset(() => cleanups.forEach((cleanup) => cleanup()));
  return { el, cleanups, leaves, opacity: () => Number(el.style.opacity) };
}

function observer(): FakeIntersectionObserver {
  return FakeIntersectionObserver.current!;
}

describe("ACTIVE.VIEW", () => {
  test("starts at key 0 and plays forward when it scrolls into view", () => {
    const { el, opacity } = mount({ active: ACTIVE.VIEW });
    expect(opacity()).toBe(0);
    observer().report(el, 0.5);
    advance(100);
    expect(opacity()).toBe(1);
  });

  test("plays once by default: leaving view does not play back", () => {
    const { el, opacity } = mount({ active: ACTIVE.VIEW });
    observer().report(el, 0.5);
    advance(100);
    observer().report(el, 0);
    advance(100);
    expect(opacity()).toBe(1);
  });

  test("reverse plays back when it leaves view and again on re-entry", () => {
    const { el, opacity } = mount({ active: ACTIVE.VIEW, more: { reverse: true } });
    observer().report(el, 0.5);
    advance(100);
    observer().report(el, 0);
    advance(100);
    expect(opacity()).toBe(0);
    observer().report(el, 0.5);
    advance(100);
    expect(opacity()).toBe(1);
  });

  test("ratios below the threshold do not count as in view", () => {
    const { el, opacity } = mount({ active: ACTIVE.VIEW });
    observer().report(el, 0.1);
    advance(100);
    expect(opacity()).toBe(0);
  });

  test("once: false with reverse off still plays back on leave", () => {
    const { el, opacity } = mount({ active: ACTIVE.VIEW, once: false });
    observer().report(el, 0.5);
    advance(100);
    observer().report(el, 0);
    advance(100);
    expect(opacity()).toBe(0);
  });

  test("once stops observing after the first play", () => {
    const { el } = mount({ active: ACTIVE.VIEW });
    observer().report(el, 0.5);
    expect(FakeIntersectionObserver.unobserved).toContain(el);
  });

  test("does not add a leave, so detach does not wait for it", () => {
    const { leaves } = mount({ active: ACTIVE.VIEW, more: { reverse: true } });
    expect(leaves).toEqual([]);
  });

  test("cleanup stops observing", () => {
    const { el, cleanups } = mount({ active: ACTIVE.VIEW, more: { reverse: true } });
    for (const cleanup of cleanups) cleanup();
    expect(observer().targets.has(el)).toBe(false);
  });
});

describe("ACTIVE.HOVER", () => {
  test("pointer enter plays forward and pointer leave reverses", () => {
    const { el, opacity } = mount({ active: ACTIVE.HOVER });
    el.dispatchEvent(new Event("pointerenter"));
    advance(100);
    expect(opacity()).toBe(1);
    el.dispatchEvent(new Event("pointerleave"));
    advance(100);
    expect(opacity()).toBe(0);
  });

  test("once ignores the pointer after the first forward play", () => {
    const { el, opacity } = mount({ active: ACTIVE.HOVER, once: true });
    el.dispatchEvent(new Event("pointerenter"));
    advance(100);
    el.dispatchEvent(new Event("pointerleave"));
    advance(100);
    expect(opacity()).toBe(1);
    el.dispatchEvent(new Event("pointerenter"));
    advance(100);
    expect(opacity()).toBe(1);
  });

  test("cleanup removes the listeners", () => {
    const { el, cleanups, opacity } = mount({ active: ACTIVE.HOVER });
    for (const cleanup of cleanups) cleanup();
    el.dispatchEvent(new Event("pointerenter"));
    advance(100);
    expect(opacity()).toBe(0);
  });

  test("does not add a leave, so detach does not wait for it", () => {
    const { leaves } = mount({ active: ACTIVE.HOVER });
    expect(leaves).toEqual([]);
  });
});

describe("ACTIVE.IN", () => {
  test("is the default: plays on attach and adds no leave", () => {
    const { leaves, opacity } = mount();
    advance(100);
    expect(opacity()).toBe(1);
    expect(leaves).toEqual([]);
  });
});

describe("ACTIVE.MANUAL", () => {
  test("does not play by itself and adds no leave", () => {
    const { leaves, opacity } = mount({ active: ACTIVE.MANUAL });
    advance(200);
    expect(opacity()).toBe(0);
    expect(leaves).toEqual([]);
  });
});

describe("a store or store.from value as active", () => {
  test("the first value is applied without animating", () => {
    const on = store(true);
    const { opacity } = mount({ active: on });
    expect(opacity()).toBe(1);
  });

  test("a later truthy value plays forward and a falsy value plays back from the current progress", () => {
    const on = store(false);
    const { opacity } = mount({ active: on });
    expect(opacity()).toBe(0);
    on.value = true;
    advance(50);
    expect(opacity()).toBeCloseTo(0.5, 1);
    on.value = false;
    advance(25);
    expect(opacity()).toBeCloseTo(0.25, 1);
  });

  test("a store.from value works the same way", () => {
    const count = store(0);
    const big = store.from(() => count.value > 5);
    const { opacity } = mount({ active: big });
    count.value = 9;
    advance(100);
    expect(opacity()).toBe(1);
  });

  test("once plays forward only the first time a truthy value arrives", () => {
    const on = store(false);
    const { opacity } = mount({ active: on, once: true });
    on.value = true;
    advance(100);
    on.value = false;
    advance(100);
    expect(opacity()).toBe(1);
  });
});
