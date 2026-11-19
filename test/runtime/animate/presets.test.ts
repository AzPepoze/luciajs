import { describe, expect, test } from "bun:test";
import { PRESET } from "@runtime/animate/presets.ts";
import { DEFAULT_CURVE } from "@runtime/animate/keyform.ts";
import { prepareTimeline, type Keyframes } from "@runtime/animate/keyframes.ts";
import { ownTimelines } from "@runtime/animate/timeline.ts";

const presets = Object.entries(PRESET) as [string, Keyframes][];

describe("PRESET", () => {
  test("is frozen", () => {
    expect(Object.isFrozen(PRESET)).toBe(true);
  });

  test.each(presets)("%s has keys 0 and 1 and prepares", (_name, keyframes) => {
    expect(() => prepareTimeline(keyframes, DEFAULT_CURVE)).not.toThrow();
  });

  test.each(presets)("%s uses style keys only, so the item curve applies", (_name, keyframes) => {
    for (const style of Object.values(keyframes)) {
      expect(Array.isArray(style)).toBe(false);
    }
  });

  test.each(presets)("%s uses individual properties, not transform", (_name, keyframes) => {
    for (const style of Object.values(keyframes)) {
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
      prepareTimeline(PRESET.SLIDE_UP, DEFAULT_CURVE),
      prepareTimeline(PRESET.ZOOM, DEFAULT_CURVE),
    ]);
    expect(timelines.map((timeline) => timeline.props)).toEqual([["translate", "opacity"], ["scale"]]);
  });
});
