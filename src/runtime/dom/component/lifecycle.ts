import type { Cleanup } from "../template/bindings.ts";
import { runtimeError } from "../../errors.ts";

export type AttachHook = (root: ParentNode) => unknown;

let currentAttachHooks: AttachHook[] | null = null;

/** Adds a hook that runs after the component is placed. A function it returns runs on detach. */
export function onAttach(hook: AttachHook): void {
  if (!currentAttachHooks) throw runtimeError("L2070");
  currentAttachHooks.push(hook);
}

/** Adds a hook that runs when the component is detached. */
export function onDetach(hook: AttachHook): void {
  onAttach((root) => () => hook(root));
}

/** Runs `render` and collects the hooks it registers into `hooks`. */
export function collectAttachHooks<T>(hooks: AttachHook[], render: () => T): T {
  const previous = currentAttachHooks;
  currentAttachHooks = hooks;
  try {
    return render();
  } finally {
    currentAttachHooks = previous;
  }
}

export function runAttach(hooks: AttachHook[], root: Node, cleanups: Cleanup[]): void {
  for (const hook of hooks) {
    const cleanup = hook(root as ParentNode);
    if (typeof cleanup === "function") cleanups.push(cleanup as Cleanup);
  }
}
