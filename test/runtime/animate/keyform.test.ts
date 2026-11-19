import { describe, expect, test } from "bun:test";
import { TRANSITION } from "@runtime/animate/easing.ts";
import { DEFAULT_CURVE, readCurve, readKey } from "@runtime/animate/keyform.ts";
import { prepareTimeline, type Keyframes } from "@runtime/animate/keyframes.ts";
import { EASE } from "@runtime/animate/modes.ts";
import { writeProgress } from "@runtime/animate/timeline.ts";

const { QUAD, CUBIC, LINEAR } = TRANSITION;

/** The opacity written at `progress` for keys 0 and 1 whose second key is `end`, under `curve`. */
function opacityAt(end: Keyframes[number], progress: number, curve = DEFAULT_CURVE): string {
  const style = document.createElement("div").style;
  const timeline = prepareTimeline({ 0: { opacity: 0 }, 1: end }, curve);
  writeProgress(style, timeline, progress);
  return style.opacity;
}

describe("key forms", () => {
  test("a bare style uses the item curve (default CUBIC + OUT)", () => {
    // OUT of CUBIC at the middle: 1 - (1 - 0.5)^3 = 0.875
    expect(opacityAt({ opacity: 1 }, 0.5)).toBe("0.875");
  });

  test("[transition, style] keeps the item ease", () => {
    // OUT of QUAD at the middle: 1 - 0.5^2 = 0.75
    expect(opacityAt([QUAD, { opacity: 1 }], 0.5)).toBe("0.75");
  });

  test("[ease, style] keeps the item transition", () => {
    // IN of CUBIC at the middle: 0.5^3 = 0.125
    expect(opacityAt([EASE.IN, { opacity: 1 }], 0.5)).toBe("0.125");
  });

  test("[transition, ease, style] sets both", () => {
    // IN of QUAD at the middle: 0.5^2 = 0.25
    expect(opacityAt([QUAD, EASE.IN, { opacity: 1 }], 0.5)).toBe("0.25");
  });

  test("a key's own curve overrides the item curve", () => {
    expect(opacityAt([LINEAR, EASE.IN, { opacity: 1 }], 0.5, { transition: QUAD, ease: EASE.OUT })).toBe("0.5");
  });

  test("the item curve replaces the library default for keys without one", () => {
    expect(opacityAt({ opacity: 1 }, 0.5, { transition: LINEAR, ease: EASE.IN })).toBe("0.5");
  });

  test("readKey fills in the item curve for a bare style", () => {
    const [transition, ease, style] = readKey({ opacity: 1 }, { transition: QUAD, ease: EASE.IN });
    expect([transition, ease, style]).toEqual([QUAD, EASE.IN, { opacity: 1 }]);
  });
});

describe("item curve", () => {
  test("missing fields take the library defaults", () => {
    expect(readCurve({})).toEqual({ transition: CUBIC, ease: EASE.OUT });
  });

  test("a given transition or ease replaces only that field", () => {
    expect(readCurve({ ease: EASE.INOUT })).toEqual({ transition: CUBIC, ease: EASE.INOUT });
  });

  test("an ease passed as transition is an error", () => {
    expect(() => readCurve({ transition: EASE.IN as never })).toThrow("animate transition must be a function of t");
  });

  test("a transition passed as ease is an error", () => {
    expect(() => readCurve({ ease: QUAD as never })).toThrow("animate ease must be EASE.IN, EASE.OUT or EASE.INOUT");
  });
});

describe("key form errors", () => {
  test("a key with one array item is an error", () => {
    expect(() => readKey([QUAD] as never, DEFAULT_CURVE)).toThrow("animate key must be a style object");
  });

  test("a key that is not a style object is an error", () => {
    expect(() => readKey("opacity" as never, DEFAULT_CURVE)).toThrow("animate key must be a style object");
  });

  test("a transition in the ease slot is an error", () => {
    expect(() => readKey([QUAD, LINEAR, {}] as never, DEFAULT_CURVE)).toThrow("animate ease must be");
  });

  test("an ease in the transition slot of a three-part key is an error", () => {
    expect(() => readKey([EASE.IN, EASE.OUT, {}] as never, DEFAULT_CURVE)).toThrow("animate transition must be");
  });
});
