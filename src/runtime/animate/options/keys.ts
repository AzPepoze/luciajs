import { closestName } from "@compiler/utils/closest.ts";
import type { Values } from "@compiler/errors/create.ts";

/** The keys of an AnimateItem. */
export const ITEM_KEYS: readonly string[] = [
  "style",
  "when",
  "once",
  "more",
  "midway",
  "keep",
  "control",
  "duration",
  "delay",
  "loop",
  "backAndForth",
];

/** Old item keys. Each one has its own error, and they tell an item apart from keyframes. */
export const OLD_ITEM_KEYS: readonly string[] = [
  "animation",
  "active",
  "ease",
  "curve",
  "transition",
  "reverse",
  "alternate",
];

/** The one word key of keyframes. The other keys are numbers from 0 to 1. */
export const KEYFRAMES_NAME = "default";

export const KEYFRAMES_HINT = "Use a number from 0 to 1, or 'default'.";
export const SPELLING_HINT = "Check the spelling of the key.";

export const VIEW_KEYS: readonly string[] = ["margin", "amount", "reverse"];
export const HOVER_KEYS: readonly string[] = ["inDelay", "outDelay", "out", "outDuration"];
export const SCROLL_KEYS: readonly string[] = ["start", "end", "follow", "part"];
export const DETACH_KEYS: readonly string[] = ["keepSpace"];

/** The `more` keys of each trigger, by its WHEN member name. */
export const MORE_KEYS_BY_WHEN: Readonly<Record<string, readonly string[]>> = {
  VIEW: VIEW_KEYS,
  HOVER: HOVER_KEYS,
  SCROLL: SCROLL_KEYS,
  DETACH: DETACH_KEYS,
};

export function isNumberKey(key: string): boolean {
  return key.trim() !== "" && Number.isFinite(Number(key));
}

export function isKeyframesKey(key: string): boolean {
  return key === KEYFRAMES_NAME || isNumberKey(key);
}

export function hasItemKey(keys: readonly string[]): boolean {
  return keys.some((key) => ITEM_KEYS.includes(key) || OLD_ITEM_KEYS.includes(key));
}

/** Names as a list: "a", "a or b", "a, b or c". */
export function keyList(names: readonly string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}`;
}

/** The values for an unknown-key error: a "did you mean" hint when a name is close, else the fallback. */
export function unknownKeyValues(key: string, names: readonly string[], fallback: string): Values {
  const near = closestName(key, names);
  const tip = near === undefined ? fallback : `did you mean '${near}'?`;
  return { key, keys: keyList(names), tip };
}
