import { runtimeError } from "../../errors.ts";
import { readMidway, MIDWAY_KEYS, type AnimateMidway } from "./midway-options.ts";
import { readMs } from "./read-ms.ts";
import { readScroll, type ScrollMore } from "./scroll-options.ts";
import { readSpace, type SpaceMore } from "./space-options.ts";
import { SPACE_KEYS, SPELLING_HINT, unknownKeyValues, VIEW_KEYS } from "./keys.ts";
import { readViewMore, type ViewMore } from "./view-options.ts";

const HOVER_CONFIG_KEYS = ["inDelay", "outDelay", "outDuration"];
const SCROLL_CONFIG_KEYS = ["start", "end", "part"];

/** Checks that a config value is an object with only the allowed keys. */
export function readObject(
  value: unknown,
  name: string,
  keys: readonly string[],
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw runtimeError("L2065", { name, value: String(value) });
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) {
      throw runtimeError("L2066", { name, ...unknownKeyValues(key, keys, SPELLING_HINT) });
    }
  }
  return value as Record<string, unknown>;
}

// Each section check reuses the reader the items use, so a bad value fails the same way.

export function checkMidway(value: unknown): void {
  const midway = readObject(value, "midway", MIDWAY_KEYS);
  if (typeof midway.turn === "function") {
    throw runtimeError("L2026", { value: String(midway.turn) });
  }
  readMidway(midway as AnimateMidway);
}

export function checkView(value: unknown): void {
  readViewMore(readObject(value, "view", VIEW_KEYS) as ViewMore);
}

export function checkHover(value: unknown): void {
  const hover = readObject(value, "hover", HOVER_CONFIG_KEYS);
  readMs(hover.inDelay as number | undefined, 0, "hover.inDelay");
  readMs(hover.outDelay as number | undefined, 0, "hover.outDelay");
  readMs(hover.outDuration as number | undefined, 0, "hover.outDuration");
}

export function checkScroll(value: unknown): void {
  readScroll(readObject(value, "scroll", SCROLL_CONFIG_KEYS) as ScrollMore);
}

export function checkSpace(value: unknown): void {
  readSpace(readObject(value, "space", SPACE_KEYS) as SpaceMore);
}
