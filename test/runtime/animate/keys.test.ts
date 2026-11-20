import { describe, expect, test } from "bun:test";
import { prepareTimeline, type Keyframes } from "@runtime/animate/keyframes.ts";
import { readItem } from "@runtime/animate/options.ts";
import { withWhere } from "@runtime/errors.ts";
import { EASE } from "@runtime/animate/modes.ts";
import { WHEN } from "@runtime/animate/trigger.ts";

const { QUART } = EASE.STYLE;
const frames = { 0: { opacity: 0 }, 1: { opacity: 1 } };

function thrown(read: () => unknown): { code?: string; hint?: string; message: string } {
  try {
    read();
  } catch (error) {
    return error as { code?: string; hint?: string; message: string };
  }
  throw new Error("expected an error");
}

describe("unknown keyframes keys", () => {
  test("a typo of default names the key and suggests default", () => {
    const bad = { defaut: [QUART, EASE.OUT], ...frames } as unknown as Keyframes;
    const error = thrown(() => prepareTimeline(bad));
    expect(error.code).toBe("L2054");
    expect(error.message).toBe(
      "unknown keyframes key 'defaut'. Keys are numbers from 0 to 1 or 'default'",
    );
    expect(error.hint).toBe("did you mean 'default'?");
  });

  test("a key far from every name gives the plain hint", () => {
    const bad = { banana: 1, ...frames } as unknown as Keyframes;
    expect(thrown(() => prepareTimeline(bad)).hint).toBe("Use a number from 0 to 1, or 'default'.");
  });

  test("a dev location for the key is used instead of the attribute's", () => {
    const bad = { defaut: 1, ...frames } as unknown as Keyframes;
    const keys = { defaut: "src/Card.lucia:3:9" };
    const error = withWhere("src/Card.lucia:12:4", () => thrown(() => prepareTimeline(bad)), keys);
    expect(error).toMatchObject({ file: "src/Card.lucia", line: 3, column: 9 });
  });
});

describe("unknown animate item keys", () => {
  test("a typo of an item key suggests the right key", () => {
    const error = thrown(() => readItem({ style: frames, durtion: 400 } as never));
    expect(error.code).toBe("L2055");
    expect(error.message).toBe("unknown animate key 'durtion'");
    expect(error.hint).toBe("did you mean 'duration'?");
  });

  test("a valid item gives no error", () => {
    expect(() => readItem({ style: frames, duration: 400 })).not.toThrow();
  });
});

describe("DETACH more keepSpace", () => {
  const detach = (more: unknown) => ({ style: frames, when: WHEN.DETACH, more }) as never;

  test("keepSpace must be true or false", () => {
    const error = thrown(() => readItem(detach({ keepSpace: "yes" })));
    expect(error.code).toBe("L2056");
    expect(error.message).toBe("animate more keepSpace must be true or false, got yes");
  });

  test("a misspelled keepSpace names the right key", () => {
    expect(thrown(() => readItem(detach({ keepSpce: true }))).hint).toBe(
      "did you mean 'keepSpace'?",
    );
  });

  test("without keepSpace a DETACH item closes its space", () => {
    expect(readItem(detach(undefined)).shrink).toEqual({
      duration: 300,
      delay: 0,
      keyframes: frames,
    });
  });

  test("keepSpace: true keeps the space, so there is nothing to close", () => {
    expect(readItem(detach({ keepSpace: true })).shrink).toBeUndefined();
    expect(readItem(detach({ keepSpace: true })).more.detach).toEqual({ keepSpace: true });
  });
});
