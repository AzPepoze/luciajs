import { afterEach, describe, expect, test } from "bun:test";
import { animate } from "@runtime/animate/bind.ts";
import type { Animate, AnimateItem } from "@runtime/animate/animation.ts";
import { TRANSITION } from "@runtime/animate/easing.ts";
import { PRESET } from "@runtime/animate/presets.ts";
import type { Keyframes } from "@runtime/animate/keyframes.ts";
import { EASE } from "@runtime/animate/modes.ts";
import { ACTIVE } from "@runtime/animate/trigger.ts";
import type { Leave } from "@runtime/dom/leave.ts";
import { advance, onReset, pendingFrames, setReducedMotion, useFakeClock } from "./clock.ts";

useFakeClock();
afterEach(() => setReducedMotion(false));

const { LINEAR } = TRANSITION;
const { IN } = EASE;

const fade = (from: number, to: number): Keyframes => ({
  0: [LINEAR, IN, { opacity: from }],
  1: [LINEAR, IN, { opacity: to }],
});

const width = (from: string, to: string): Keyframes => ({
  0: [LINEAR, IN, { width: from }],
  1: [LINEAR, IN, { width: to }],
});

function run(value: Animate) {
  const el = document.createElement("div");
  const cleanups: Array<() => void> = [];
  const leaves: Leave[] = [];
  animate(el, () => value, cleanups, leaves);
  onReset(() => cleanups.forEach((cleanup) => cleanup()));
  return { el, cleanups, leaves, opacity: () => Number(el.style.opacity) };
}

/** An item that runs for 100 ms unless the test says otherwise. */
const timed = (animation: Keyframes, extra: Omit<AnimateItem, "animation"> = {}): AnimateItem => ({
  animation,
  duration: 100,
  ...extra,
});

describe("enter on attach", () => {
  test("enter plays from 0 to 1 and the final style stays", () => {
    const { opacity } = run(timed(fade(0, 1)));
    expect(opacity()).toBe(0);
    advance(50);
    expect(opacity()).toBeCloseTo(0.5, 1);
    advance(60);
    expect(opacity()).toBe(1);
  });

  test("no leave is added, so detach does not wait", () => {
    const { leaves } = run(timed(fade(0, 1)));
    expect(leaves).toEqual([]);
  });

  test("a duration of 0 finishes on the next frame", () => {
    const { opacity } = run(timed(fade(0, 1), { duration: 0 }));
    advance(16);
    expect(opacity()).toBe(1);
  });

  test("delay holds the forward play back", () => {
    const { opacity } = run(timed(fade(0, 1), { delay: 100 }));
    advance(50);
    expect(opacity()).toBe(0);
    advance(100);
    expect(opacity()).toBeCloseTo(0.5, 1);
    advance(100);
    expect(opacity()).toBe(1);
  });

  test("a bare keyframes value uses the default 300 ms", () => {
    const { opacity } = run(fade(0, 1));
    advance(150);
    expect(opacity()).toBeCloseTo(0.5, 1);
    advance(160);
    expect(opacity()).toBe(1);
  });
});

describe("ACTIVE.OUT", () => {
  test("nothing plays on attach; the item's own keyframes play on detach", async () => {
    const { leaves, opacity } = run(timed(fade(1, 0), { active: ACTIVE.OUT }));
    expect(opacity()).toBe(1);
    advance(100);
    expect(opacity()).toBe(1);
    expect(leaves.length).toBe(1);
    const leaving = leaves[0]!();
    advance(50);
    expect(opacity()).toBeCloseTo(0.5, 1);
    advance(60);
    await leaving;
    expect(opacity()).toBe(0);
  });

  test("an IN and an OUT item on one element use their own keyframes", async () => {
    const { el, leaves } = run([timed(fade(0, 1)), timed(width("0px", "10px"), { active: ACTIVE.OUT })]);
    advance(100);
    expect(Number(el.style.opacity)).toBe(1);
    expect(el.style.width).toBe("0px");
    const leaving = leaves[0]!();
    advance(100);
    await leaving;
    expect(el.style.width).toBe("10px");
  });

  test("detach waits for the longest OUT item", async () => {
    const { leaves } = run([timed(fade(1, 0)), timed(fade(1, 0), { duration: 300, active: ACTIVE.OUT })]);
    let done = false;
    const leaving = leaves[0]!().then(() => (done = true));
    advance(150);
    expect(done).toBe(false);
    advance(200);
    await leaving;
    expect(done).toBe(true);
  });
});

describe("a list of animations", () => {
  test("items with different durations both finish", () => {
    const { opacity, el } = run([timed(fade(0, 1)), { animation: width("0px", "10px"), duration: 300 }]);
    advance(120);
    expect(opacity()).toBe(1);
    expect(el.style.width).not.toBe("10px");
    advance(250);
    expect(el.style.width).toBe("10px");
  });

  test("a property animated by two items takes the value of the later item", () => {
    const { opacity } = run([timed(fade(0, 1)), timed(fade(1, 0.5))]);
    advance(50);
    expect(opacity()).toBeCloseTo(0.75, 1);
    advance(60);
    expect(opacity()).toBeCloseTo(0.5, 2);
  });

  test("a later item keeps its property even after an earlier item would write it", () => {
    const { el } = run([timed(fade(0, 1), { duration: 200 }), timed(fade(1, 0.5), { duration: 50 })]);
    advance(300);
    expect(Number(el.style.opacity)).toBe(0.5);
  });

  test("items with different triggers play on their own triggers", () => {
    const { el } = run([timed(fade(0, 1)), { animation: width("0px", "10px"), active: ACTIVE.HOVER, duration: 100 }]);
    advance(100);
    expect(el.style.width).toBe("0px");
    el.dispatchEvent(new Event("pointerenter"));
    advance(100);
    expect(el.style.width).toBe("10px");
  });
});

describe("loops", () => {
  test("loop: 2 plays the timeline twice, restarting from 0", () => {
    const { opacity } = run(timed(fade(0, 1), { loop: 2 }));
    advance(150);
    expect(opacity()).toBeCloseTo(0.5, 1);
    advance(100);
    expect(opacity()).toBe(1);
    advance(100);
    expect(pendingFrames()).toBe(0);
  });

  test("backAndForth ping-pongs 0 to 1 to 0", () => {
    const { opacity } = run(timed(fade(0, 1), { loop: true, backAndForth: true }));
    advance(100);
    expect(opacity()).toBe(1);
    advance(100);
    expect(opacity()).toBe(0);
    advance(100);
    expect(opacity()).toBe(1);
  });

  test("alternate is rejected with a rename error", () => {
    expect(() => run(timed(fade(0, 1), { loop: true, alternate: true } as never))).toThrow("alternate was renamed to backAndForth");
    expect(() => run({ alternate: true } as never)).toThrow("alternate was renamed to backAndForth");
  });

  test("loop forever keeps the frame loop running until cleanup", () => {
    const { cleanups } = run(timed(fade(0, 1), { loop: true }));
    advance(1000);
    expect(pendingFrames()).toBe(1);
    for (const cleanup of cleanups) cleanup();
    advance(200);
    expect(pendingFrames()).toBe(0);
  });

  test("loop: 0 means no loop", () => {
    const { opacity } = run(timed(fade(0, 1), { loop: 0 }));
    advance(100);
    expect(opacity()).toBe(1);
    expect(pendingFrames()).toBe(0);
  });
});

describe("shared frame loop and reduced motion", () => {
  test("many animations share one frame request", () => {
    for (let i = 0; i < 50; i++) run(timed(fade(0, 1)));
    expect(pendingFrames()).toBe(1);
    advance(100);
    expect(pendingFrames()).toBe(0);
  });

  test("reduced motion jumps to the end state without frames", () => {
    setReducedMotion(true);
    const { opacity } = run(timed(fade(0, 1)));
    expect(opacity()).toBe(1);
    expect(pendingFrames()).toBe(0);
  });

  test("reduced motion plays only the first pass of a loop", () => {
    setReducedMotion(true);
    const { opacity } = run(timed(fade(0, 1), { loop: true }));
    expect(opacity()).toBe(1);
    expect(pendingFrames()).toBe(0);
  });
});

describe("cleanup", () => {
  test("cancelling stops the animation", () => {
    const { cleanups, opacity } = run(timed(fade(0, 1), { loop: true }));
    advance(30);
    for (const cleanup of cleanups) cleanup();
    const stopped = opacity();
    advance(200);
    expect(opacity()).toBe(stopped);
  });
});

describe("keyframes are read at every play", () => {
  test("a getter gives new keyframes on the next play", () => {
    let current = fade(0, 1);
    const el = document.createElement("div");
    const cleanups: Array<() => void> = [];
    animate(el, () => timed(current, { active: ACTIVE.HOVER }), cleanups, []);
    onReset(() => cleanups.forEach((cleanup) => cleanup()));
    current = fade(0, 0.25);
    el.dispatchEvent(new Event("pointerenter"));
    advance(100);
    expect(Number(el.style.opacity)).toBe(0.25);
  });
});

describe("keep", () => {
  test("keep: false removes the styles once a play ends at 1", () => {
    const { el } = run(timed(fade(0, 1), { keep: false }));
    advance(100);
    expect(el.style.opacity).toBe("");
  });

  test("keep is true by default, so the final style stays", () => {
    const { el } = run(timed(fade(0, 1)));
    advance(100);
    expect(el.style.opacity).toBe("1");
  });
});

describe("first frame", () => {
  test("the key 0 style is written before the element is attached", () => {
    const parent = document.createElement("div");
    const el = document.createElement("div");
    const cleanups: Array<() => void> = [];
    animate(el, () => timed(fade(0, 1)), cleanups, []);
    expect(el.style.opacity).toBe("0");
    parent.appendChild(el);
    onReset(() => cleanups.forEach((cleanup) => cleanup()));
  });
});

describe("validation", () => {
  test("an item without animation is an error", () => {
    expect(() => run({ duration: 100 } as AnimateItem)).toThrow("animate item needs an animation");
  });

  test("keyframes without the keys 0 and 1 are an error", () => {
    expect(() => run({ animation: { 0: [LINEAR, IN, {}] } })).toThrow("animate keyframes must include the keys 0 and 1");
  });

  test("an unknown active is an error", () => {
    expect(() => run({ animation: fade(0, 1), active: "view" as never })).toThrow(
      "animate active must be ACTIVE.IN, OUT, VIEW, HOVER or MANUAL, or a store",
    );
  });

  test("a negative duration is an error", () => {
    expect(() => run(timed(fade(0, 1), { duration: -1 }))).toThrow("animate duration must be a time in ms");
  });
});

describe("item curve and key forms", () => {
  test("an item without a curve eases with the library default (CUBIC + OUT)", () => {
    const { opacity } = run(timed({ 0: { opacity: 0 }, 1: { opacity: 1 } }));
    advance(50);
    // OUT of CUBIC at the middle is 0.875.
    expect(opacity()).toBeCloseTo(0.875, 3);
  });

  test("item transition and ease replace the defaults for every key", () => {
    const { opacity } = run(timed({ 0: { opacity: 0 }, 1: { opacity: 1 } }, { transition: TRANSITION.QUAD, ease: EASE.IN }));
    advance(50);
    // IN of QUAD at the middle is 0.25.
    expect(opacity()).toBeCloseTo(0.25, 3);
  });

  test("a bare preset plays as an animation", () => {
    const { opacity } = run(PRESET.FADE);
    expect(opacity()).toBe(0);
    advance(400);
    expect(opacity()).toBe(1);
  });
});
