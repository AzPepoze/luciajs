import type { Member } from "./controller.ts";
import type { Player } from "./player.ts";

/** The players of one slot. Every play reloads their keyframes first. */
export class Group implements Member {
  constructor(
    private readonly players: Player[],
    private readonly refresh: () => void,
  ) {}

  show(progress: number): void {
    for (const player of this.players) player.show(progress);
  }

  seek(progress: number): void {
    for (const player of this.players) player.seek(progress);
  }

  async forward(): Promise<void> {
    this.refresh();
    await Promise.all(this.players.map((player) => player.forward()));
  }

  /** Plays forward from the look the element has now. Used when a play starts mid-way. */
  async forwardFromCurrent(): Promise<void> {
    this.refresh();
    for (const player of this.players) player.startFromCurrent();
    await Promise.all(this.players.map((player) => player.forward()));
  }

  /** Resolves when the slowest item has returned to its start. */
  async backward(): Promise<void> {
    this.refresh();
    await Promise.all(this.players.map((player) => player.backward()));
  }

  cancel(): void {
    for (const player of this.players) player.cancel();
  }
}
