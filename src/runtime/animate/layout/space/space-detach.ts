import type { Cleanup } from "../../../dom/template/bindings.ts";
import type { Leave } from "../../../dom/component/leave.ts";
import type { Group } from "../../play/group.ts";
import { Closer, type SpaceSpec } from "./space-closer.ts";
import { isFlowBox } from "./space-lift.ts";
import { prefersReducedMotion } from "../../play/reduced-motion.ts";

// With animateSpace, a DETACH leave also closes the space the element holds. Without it, the siblings jump.
export function bindDetach(
  el: HTMLElement,
  group: Group,
  spec: SpaceSpec | undefined,
  leaves: Leave[],
  cleanups: Cleanup[],
): void {
  let closer: Closer | undefined;
  leaves.push(() => {
    if (spec === undefined || !canMove(el)) return group.forward();
    closer = new Closer(el, spec);
    return Promise.all([group.forward(), closer.start()]).then(() => undefined);
  });
  cleanups.push(() => closer?.cancel());
}

export function canMove(el: HTMLElement): boolean {
  return !prefersReducedMotion() && isFlowBox(el);
}
