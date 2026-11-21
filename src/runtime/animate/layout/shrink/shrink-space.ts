import type { Cleanup } from "../../../dom/bindings.ts";
import type { Leave } from "../../../dom/leave.ts";
import type { Group } from "../../play/group.ts";
import { Closer, type ShrinkSpec } from "./shrink-closer.ts";
import { readSpace, type Space } from "./shrink-box.ts";
import { prefersReducedMotion } from "../../play/reduced-motion.ts";

/**
 * A DETACH leave. In a flow box it also closes the space the element holds, so its siblings
 * slide to their new places while it leaves. The element itself plays its keyframes in place.
 */
export function bindDetach(
  el: HTMLElement,
  group: Group,
  spec: ShrinkSpec | undefined,
  leaves: Leave[],
  cleanups: Cleanup[],
): void {
  let closer: Closer | undefined;
  leaves.push(() => {
    if (spec === undefined) return group.forward();
    const space = spaceToClose(el);
    if (space === undefined) return group.forward();
    closer = new Closer(el, space, spec);
    return Promise.all([group.forward(), closer.start()]).then(() => undefined);
  });
  cleanups.push(() => closer?.cancel());
}

/** The box to close, or undefined when the space stays: reduced motion, or a box that takes no space. */
function spaceToClose(el: HTMLElement): Space | undefined {
  return prefersReducedMotion() ? undefined : readSpace(el);
}
