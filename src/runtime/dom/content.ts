import type { Cleanup } from "./bindings.ts";
import type { Slot } from "./component.ts";
import type { Leave } from "./leave.ts";

/** `<CONTENT />`: renders the children the parent gave the component, in place of the marker. */
export function bindContent(
  marker: Node,
  slot: Slot | undefined,
  cleanups: Cleanup[],
  leaves: Leave[],
): void {
  if (slot) marker.parentNode!.insertBefore(slot(cleanups, leaves), marker);
  (marker as ChildNode).remove();
}
