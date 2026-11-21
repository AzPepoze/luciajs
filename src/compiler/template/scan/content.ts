import { blockCheck } from "../check/checks.ts";
import type { Cursor } from "./cursor.ts";
import { readAttributes } from "./attributes.ts";
import type { ScanScope } from "./scope.ts";

export const CONTENT_TAG = "CONTENT";

/** Checks a `<CONTENT />` tag and claims the component's one content slot. */
export function claimContent(c: Cursor, start: number, scope: ScanScope): void {
  const { selfClosing } = readAttributes(c, CONTENT_TAG, start, blockCheck(CONTENT_TAG, new Map()));
  if (!selfClosing) c.fail("L1036", {}, start);
  if (scope.contentUsed) c.fail("L1035", {}, start);
  scope.contentUsed = true;
}
