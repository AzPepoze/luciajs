import type { Cleanup } from "../../../dom/template/bindings.ts";
import type { Leave } from "../../../dom/component/leave.ts";
import type { Group } from "../../play/group.ts";
import { Closer, type ShrinkSpec } from "./shrink-closer.ts";
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
    if (spec === undefined || !canClose(el)) return group.forward();
    closer = new Closer(el, spec);
    return Promise.all([group.forward(), closer.start()]).then(() => undefined);
  });
  cleanups.push(() => closer?.cancel());
}

function canClose(el: HTMLElement): boolean {
  return !prefersReducedMotion() && isFlowBox(el);
}

function isFlowBox(el: HTMLElement): boolean {
  if (el.parentElement === null) return false;
  const { display, position } = getComputedStyle(el);
  const box = display !== "inline" && display !== "contents" && display !== "none";
  return box && (position === "static" || position === "relative" || position === "sticky");
}
