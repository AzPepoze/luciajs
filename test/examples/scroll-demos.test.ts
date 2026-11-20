import { afterEach, describe, expect, test } from "bun:test";
import { host, mount, resetMounts } from "../runtime/dom/fixtures/mount.ts";
import ScrollCenterLeave from "../../examples/web/src/demos/motion/ScrollCenterLeave.lucia";
import ScrollDefault from "../../examples/web/src/demos/motion/ScrollDefault.lucia";
import ScrollEffects from "../../examples/web/src/demos/motion/ScrollEffects.lucia";
import ScrollEnterCenter from "../../examples/web/src/demos/motion/ScrollEnterCenter.lucia";
import ScrollLines from "../../examples/web/src/demos/motion/ScrollLines.lucia";
import ScrollPartFollow from "../../examples/web/src/demos/motion/ScrollPartFollow.lucia";
import ScrollPresets from "../../examples/web/src/demos/motion/ScrollPresets.lucia";
import ScrollTouchPoints from "../../examples/web/src/demos/motion/ScrollTouchPoints.lucia";
import ScrollTwo from "../../examples/web/src/demos/motion/ScrollTwo.lucia";
import { progressOf } from "../../examples/web/src/demos/motion/scroll-readout.ts";

afterEach(resetMounts);

const demos = [
  ["ScrollDefault", ScrollDefault, ".scroll-demo .card"],
  ["ScrollEnterCenter", ScrollEnterCenter, ".scroll-demo .card"],
  ["ScrollCenterLeave", ScrollCenterLeave, ".scroll-demo .card"],
  ["ScrollPresets", ScrollPresets, ".scroll-demo .card"],
  ["ScrollTouchPoints", ScrollTouchPoints, ".scroll-demo .card"],
  ["ScrollLines", ScrollLines, ".scroll-demo .card"],
  ["ScrollTwo", ScrollTwo, ".scroll-demo .card"],
  ["ScrollPartFollow", ScrollPartFollow, ".scroll-demo .step"],
  ["ScrollEffects", ScrollEffects, ".scroll-demo .spin"],
] as const;

describe("SCROLL demos", () => {
  test.each(demos)("%s mounts and shows its cards", (_name, component, selector) => {
    const target = host();
    mount(component, target);
    expect(target.querySelector(".scroll-demo")).not.toBeNull();
    expect(target.querySelector(selector)).not.toBeNull();
  });

  test("ScrollDefault shows its readout as a number from 0 to 1", () => {
    const target = host();
    mount(ScrollDefault, target);
    expect(target.querySelector("output")?.textContent).toMatch(/^[01]\.\d{2}$/);
  });
});

describe("scroll-readout progressOf", () => {
  function box(top: number, height: number): Element {
    const el = document.createElement("div");
    el.getBoundingClientRect = () => ({ top, height }) as DOMRect;
    return el;
  }

  test("ENTER to LEAVE is 0 at the bottom edge and 1 past the top", () => {
    Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
    const enter = { element: 0, window: 1 };
    const leave = { element: 1, window: 0 };
    expect(progressOf(box(1000, 100), enter, leave)).toBe(0);
    expect(progressOf(box(450, 100), enter, leave)).toBeCloseTo(0.5);
    expect(progressOf(box(-100, 100), enter, leave)).toBe(1);
  });
});
