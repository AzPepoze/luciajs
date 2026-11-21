import type { Cleanup } from "../template/bindings.ts";
import type { Leave } from "../component/leave.ts";

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

/** Removes the nodes between the mount's comments, without running its cleanups. */
export function removeNodes(mount: Mount): void {
  for (let node: Node | null = mount.start; node;) {
    const next: Node | null = node === mount.end ? null : node.nextSibling;
    (node as ChildNode).remove();
    node = next;
  }
}

export function disposeMount(mount: Mount): void {
  for (const cleanup of mount.cleanups) cleanup();
  removeNodes(mount);
}
