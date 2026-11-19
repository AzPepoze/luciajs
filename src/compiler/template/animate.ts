import { expressionOf, type Fail } from "./attributes.ts";
import type { AttrBinding } from "./types.ts";

const ANIMATE = "animate";
const MESSAGE_NEEDS_KEYFRAMES = "animate needs {keyframes}";

/** Rejects a bad `animate` attribute as soon as it is read. */
export function checkAnimateAttribute(attr: AttrBinding, previous: AttrBinding[], fail: Fail): void {
  if (attr.name !== ANIMATE) return;
  if (expressionOf(attr) === undefined) fail(MESSAGE_NEEDS_KEYFRAMES);
  if (previous.some((other) => other.name === ANIMATE)) fail("an element can have only one animate");
}
