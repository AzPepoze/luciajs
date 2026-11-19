import { expressionOf, type Fail } from "./attributes.ts";
import type { AttrBinding } from "./types.ts";

const ANIMATE = "animate";

/** Rejects a bad `animate` attribute as soon as it is read. */
export function checkAnimateAttribute(
  attr: AttrBinding,
  previous: AttrBinding[],
  fail: Fail,
): void {
  if (attr.name !== ANIMATE) return;
  if (expressionOf(attr) === undefined) fail("L1018");
  if (previous.some((other) => other.name === ANIMATE)) fail("L1017");
}
