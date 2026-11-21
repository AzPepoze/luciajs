import { leaveThen, type Leave } from "../component/leave.ts";
import { disposeMount, type Mount } from "./mount.ts";

async function leaveMount(mount: Mount): Promise<void> {
  await Promise.all(mount.leaves.map((leave) => leave()));
}

// Removed mounts play their leaves first. Blocks without leaves stay synchronous.
export class Outlet {
  private readonly live = new Set<Mount>();
  private readonly leavingByStart = new Map<Node, Mount>();
  private readonly leavingDone = new Set<Promise<void>>();
  private hooked = false;

  constructor(private readonly parentLeaves: Leave[]) {}

  track(mount: Mount): void {
    this.live.add(mount);
    if (!this.hooked && mount.leaves.length > 0) this.hookParent();
  }

  retire(mount: Mount): void {
    this.live.delete(mount);
    if (mount.leaves.length === 0) {
      disposeMount(mount);
      return;
    }
    this.leavingByStart.set(mount.start, mount);
    const done = leaveThen(mount.leaves, () => disposeMount(mount));
    this.leavingDone.add(done);
    void done.then(() => {
      this.leavingByStart.delete(mount.start);
      this.leavingDone.delete(done);
    });
  }

  /** Steps over the leaving rows that start at `node`, so they keep their place in the list. */
  skipLeaving(node: Node | null): Node | null {
    let current = node;
    while (current) {
      const leaving = this.leavingByStart.get(current);
      if (!leaving) return current;
      current = leaving.end.nextSibling;
    }
    return null;
  }

  disposeAll(): void {
    for (const mount of this.live) disposeMount(mount);
    this.live.clear();
  }

  private hookParent(): void {
    this.hooked = true;
    this.parentLeaves.push(async () => {
      await Promise.all([...this.live].map(leaveMount));
      await Promise.all(this.leavingDone);
    });
  }
}
