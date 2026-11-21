import type { Cleanup } from "../../../dom/template/bindings.ts";
import type { Leave } from "../../../dom/component/leave.ts";
import type { Group } from "../../play/group.ts";
import { Closer, type ShrinkSpec } from "./shrink-closer.ts";
import { readSpace, type Space } from "./shrink-box.ts";
import { prefersReducedMotion } from "../../play/reduced-motion.ts";

// In a flow box, a DETACH leave also closes the space the element holds.
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

function spaceToClose(el: HTMLElement): Space | undefined {
  return prefersReducedMotion() ? undefined : readSpace(el);
}
