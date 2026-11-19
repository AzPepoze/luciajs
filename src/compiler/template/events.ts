import { hasExpression } from "./attributes.ts";
import type { AttrBinding } from "./types.ts";

const EVENT_NAME = /^on[a-z][a-z-]*$/;

export function isEventName(name: string): boolean {
  return EVENT_NAME.test(name);
}

/** `onclick={fn}` on an element is a listener. A static `onclick="..."` stays plain HTML. */
export function isEventAttr(attr: AttrBinding): boolean {
  return isEventName(attr.name) && hasExpression(attr.parts);
}

export function eventType(name: string): string {
  return name.slice("on".length);
}
