import type { Cleanup } from "../../../dom/template/bindings.ts";
import type { SpaceSpec } from "./space-closer.ts";
import { Opener } from "./space-opener.ts";
import { canMove } from "./space-detach.ts";

// Runs after the list is placed, so the siblings are measured where they will stay.
export function bindAttach(el: HTMLElement, spec: SpaceSpec, cleanups: Cleanup[]): void {
  let opener: Opener | undefined;
  let stopped = false;
  queueMicrotask(() => {
    if (stopped || !el.isConnected || !canMove(el)) return;
    opener = new Opener(el, spec);
    void opener.start();
  });
  cleanups.push(() => {
    stopped = true;
    opener?.cancel();
  });
}
