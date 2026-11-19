import type { Cleanup } from "../bindings.ts";
import type { Leave } from "../leave.ts";

/** Content between two comments, so the whole range can be moved or removed in one walk. */
export interface Mount {
  readonly start: Comment;
  readonly end: Comment;
  readonly cleanups: Cleanup[];
  readonly leaves: Leave[];
}

export function mountBefore(
  anchor: Node,
  fragment: DocumentFragment,
  cleanups: Cleanup[],
  leaves: Leave[],
): Mount {
  const start = document.createComment("");
  const end = document.createComment("");
  fragment.prepend(start);
  fragment.append(end);
  anchor.parentNode!.insertBefore(fragment, anchor);
  return { start, end, cleanups, leaves };
}

export function moveBefore(mount: Mount, anchor: Node): void {
  const parent = anchor.parentNode!;
  for (let node: Node | null = mount.start; node;) {
    const next: Node | null = node === mount.end ? null : node.nextSibling;
    parent.insertBefore(node, anchor);
    node = next;
  }
}

function removeNodes(mount: Mount): void {
  for (let node: Node | null = mount.start; node;) {
    const next: Node | null = node === mount.end ? null : node.nextSibling;
    (node as ChildNode).remove();
    node = next;
  }
}

/** Stops the mount's watchers and animations, then removes its nodes. */
export function disposeMount(mount: Mount): void {
  for (const cleanup of mount.cleanups) cleanup();
  removeNodes(mount);
}
