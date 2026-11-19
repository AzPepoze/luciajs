import { describe, expect, test } from "bun:test";
import { PRESET } from "@runtime/animate/presets.ts";
import { prepareTimeline, type Keyframes } from "@runtime/animate/keyframes.ts";
import { ownTimelines } from "@runtime/animate/timeline.ts";

const presets = Object.entries(PRESET) as [string, Keyframes][];

/** The key styles of a preset, without its `default`. */
const keyStyles = (keyframes: Keyframes) => Object.entries(keyframes).filter(([key]) => key !== "default").map(([, style]) => style);

describe("PRESET", () => {
  test("is frozen", () => {
    expect(Object.isFrozen(PRESET)).toBe(true);
  });

  test.each(presets)("%s has keys 0 and 1 and prepares", (_name, keyframes) => {
    expect(() => prepareTimeline(keyframes)).not.toThrow();
  });

  test.each(presets)("%s uses style keys only, so the keys can take the default", (_name, keyframes) => {
    for (const style of keyStyles(keyframes)) {
      expect(Array.isArray(style)).toBe(false);
    }
  });

  test.each(presets)("%s uses individual properties, not transform", (_name, keyframes) => {
    for (const style of keyStyles(keyframes)) {
      expect("transform" in (style as object)).toBe(false);
    }
  });

  test.each([
    ["SLIDE_UP", "0px 24px"],
    ["SLIDE_DOWN", "0px -24px"],
    ["SLIDE_LEFT", "-24px 0px"],
    ["SLIDE_RIGHT", "24px 0px"],
  ] as const)("%s starts at %s, so it comes from that side", (name, start) => {
    expect(PRESET[name][0]).toMatchObject({ translate: start });
  });

  test("presets that move different properties keep all of them", () => {
    const timelines = ownTimelines([
      prepareTimeline(PRESET.SLIDE_UP),
      prepareTimeline(PRESET.ZOOM),
    ]);
    expect(timelines.map((timeline) => timeline.props)).toEqual([["translate", "opacity"], ["scale"]]);
  });
});
