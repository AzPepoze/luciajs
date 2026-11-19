import { leaveThen, type Leave } from "../leave.ts";
import { disposeMount, type Mount } from "./mount.ts";

async function leaveMount(mount: Mount): Promise<void> {
  await Promise.all(mount.leaves.map((leave) => leave()));
}

/**
 * The mounts of one block. A removed mount plays its leave animations and is disposed after them.
 * The parent's leave list gets one hook, added on the first mount that has leaves, so blocks without
 * animations keep a synchronous detach.
 */
export class Outlet {
  private readonly live = new Set<Mount>();
  private readonly leaving = new Set<Promise<void>>();
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
    const done = leaveThen(mount.leaves, () => disposeMount(mount));
    this.leaving.add(done);
    void done.then(() => this.leaving.delete(done));
  }

  disposeAll(): void {
    for (const mount of this.live) disposeMount(mount);
    this.live.clear();
  }

  private hookParent(): void {
    this.hooked = true;
    this.parentLeaves.push(async () => {
      await Promise.all([...this.live].map(leaveMount));
      await Promise.all(this.leaving);
    });
  }
}
