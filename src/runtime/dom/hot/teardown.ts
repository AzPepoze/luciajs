import type { Cleanup } from "../bindings.ts";

export function runCleanups(cleanups: Cleanup[]): void {
  for (const cleanup of cleanups) cleanup();
}

/** Removes every node from `start` to `end`, both included. This also takes rows and branches added later. */
export function removeRegion(start: ChildNode, end: ChildNode): void {
  let node: ChildNode | null = start;
  while (node) {
    const next: ChildNode | null = node.nextSibling;
    node.remove();
    if (node === end) return;
    node = next;
  }
}
