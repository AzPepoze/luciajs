import { afterEach, describe, expect, test } from "bun:test";
import { animate } from "@runtime/animate/bind.ts";
import type { AnimateItem } from "@runtime/animate/animation.ts";
import type { Leave } from "@runtime/dom/leave.ts";
import { WHEN } from "@runtime/animate/trigger.ts";
import { advance, onReset, setReducedMotion, useFakeClock } from "./clock.ts";

useFakeClock();

// happy-dom has no ResizeObserver. The layout watcher only needs observe, unobserve and disconnect.
if (!("ResizeObserver" in globalThis)) {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Mounts an element with a layout box. Its rect follows the glide transform the way the browser draws it. */
function mount(item: Omit<AnimateItem, "style"> = {}, box: Box = { x: 100, y: 40, width: 200, height: 50 }) {
  const el = document.createElement("div");
  const layout = { ...box };
  Object.defineProperties(el, {
    offsetLeft: { get: () => layout.x, configurable: true },
    offsetTop: { get: () => layout.y, configurable: true },
    offsetWidth: { get: () => layout.width, configurable: true },
    offsetHeight: { get: () => layout.height, configurable: true },
  });
  el.getBoundingClientRect = () => {
    const { tx, ty, sx, sy } = written(el);
    const left = layout.x + tx + (layout.width / 2) * (1 - sx);
    const top = layout.y + ty + (layout.height / 2) * (1 - sy);
    return { left, top, width: layout.width * sx, height: layout.height * sy } as DOMRect;
  };
  const cleanups: Array<() => void> = [];
  const leaves: Leave[] = [];
  animate(el, () => ({ when: WHEN.MOVE, ...item }) as AnimateItem, cleanups, leaves);
  onReset(() => cleanups.forEach((cleanup) => cleanup()));
  return {
    el,
    layout,
    /** Changes the layout, then runs the frames that follow, as a DOM change would. */
    change: (next: Partial<Box>, ms = 16) => {
      Object.assign(layout, next);
      document.dispatchEvent(new Event("scroll"));
      advance(ms || 0.001);
    },
    run: (ms: number) => advance(ms),
    translate: () => written(el),
    visualLeft: () => el.getBoundingClientRect().left,
    visualWidth: () => el.getBoundingClientRect().width,
  };
}

/** The glide's inline transform. An empty value is the identity. */
function written(el: HTMLElement) {
  const [tx, ty] = numbers(el.style.getPropertyValue("translate"), 0);
  const [sx, sy] = numbers(el.style.getPropertyValue("scale"), 1);
  return { tx, ty, sx, sy };
}

function numbers(text: string, fallback: number): [number, number] {
  const parts = text.split(" ").map((part) => parseFloat(part));
  return [parts[0] ?? fallback, parts[1] ?? fallback].map((n) =>
    Number.isNaN(n) ? fallback : n,
  ) as [number, number];
}

afterEach(() => setReducedMotion(false));

describe("WHEN.MOVE", () => {
  test("glides from the old place to the new one", () => {
    const view = mount({ when: WHEN.MOVE });
    view.change({ x: 300 }, 0);
    expect(view.translate().tx).toBeCloseTo(-200);
    view.run(150);
    const mid = view.translate().tx;
    expect(mid).toBeLessThan(0);
    expect(mid).toBeGreaterThan(-200);
    view.run(400);
    expect(view.el.style.getPropertyValue("translate")).toBe("");
    expect(view.visualLeft()).toBe(300);
  });

  test("ignores a size change", () => {
    const view = mount({ when: WHEN.MOVE });
    view.change({ width: 400 });
    expect(view.el.style.getPropertyValue("translate")).toBe("");
    expect(view.el.style.getPropertyValue("scale")).toBe("");
  });
});

describe("WHEN.RESIZE", () => {
  test("glides the size and keeps the new place", () => {
    const view = mount({ when: WHEN.RESIZE });
    view.change({ width: 400 }, 0);
    expect(view.translate().sx).toBeCloseTo(0.5);
    view.run(150);
    expect(view.translate().sx).toBeGreaterThan(0.5);
    expect(view.translate().sx).toBeLessThan(1);
    view.run(400);
    expect(view.visualWidth()).toBe(400);
    expect(view.el.style.getPropertyValue("scale")).toBe("");
  });

  test("ignores a place change", () => {
    const view = mount({ when: WHEN.RESIZE });
    view.change({ x: 300 });
    expect(view.el.style.getPropertyValue("translate")).toBe("");
  });
});

describe("WHEN.MOVE_OR_RESIZE", () => {
  test("glides on a move", () => {
    const view = mount({ when: WHEN.MOVE_OR_RESIZE });
    view.change({ y: 200 }, 0);
    expect(view.translate().ty).toBeCloseTo(-160);
  });

  test("glides on a resize", () => {
    const view = mount({ when: WHEN.MOVE_OR_RESIZE });
    view.change({ height: 100 }, 0);
    expect(view.translate().sy).toBeCloseTo(0.5);
  });
});

describe("layout glide details", () => {
  test("a change during a glide starts from the current visual box, without a jump", () => {
    const view = mount({ when: WHEN.MOVE });
    view.change({ x: 300 }, 0);
    view.run(100);
    const before = view.visualLeft();
    view.change({ x: 0 }, 0);
    expect(view.visualLeft()).toBeCloseTo(before, 5);
  });

  test("reduced motion jumps without a glide", () => {
    setReducedMotion(true);
    const view = mount({ when: WHEN.MOVE });
    view.change({ x: 300 });
    expect(view.el.style.getPropertyValue("translate")).toBe("");
    expect(view.visualLeft()).toBe(300);
  });

  test("once glides only for the first change", () => {
    const view = mount({ when: WHEN.MOVE, once: true });
    view.change({ x: 300 });
    view.run(400);
    view.change({ x: 0 }, 0);
    expect(view.el.style.getPropertyValue("translate")).toBe("");
  });

  test("works without style", () => {
    const view = mount({ when: WHEN.MOVE });
    expect(view.el.style.getPropertyValue("translate")).toBe("");
  });
});

describe("layout errors", () => {
  const run = (item: Record<string, unknown>) =>
    animate(
      document.createElement("div"),
      () => item as unknown as AnimateItem,
      [],
      [],
    );

  test("loop is an error", () => {
    expect(() => run({ when: WHEN.MOVE, loop: true })).toThrow(
      "loop does not work with WHEN.MOVE, RESIZE or MOVE_OR_RESIZE",
    );
  });

  test("translate and scale in style are an error", () => {
    const style = { 0: { translate: "0px 0px" }, 1: { translate: "0px 0px" } };
    expect(() => run({ when: WHEN.RESIZE, style })).toThrow(
      "translate is set by the glide and cannot be in style",
    );
  });
});
