import type { Timing } from "../options/options.ts";
import type { Playable } from "./loop.ts";
import type { Pass } from "./passes.ts";
import { dropQueued, type Queued } from "./player-queue.ts";
import { moveTo, present } from "./player-move.ts";
import { writeProgress, type Timeline } from "./timeline.ts";
import type { Turn } from "./turn.ts";

/** The running state of one element's play. The player's helper files read and write it. */
export class PlayState implements Playable {
  progress = 0;
  /** Where the current play is on its own timeline. A turn shows a blend of this and the old motion. */
  playAt = 0;
  /** Progress per ms of the last written value. Tracked every frame, so a turn can continue it. */
  speed = 0;
  at = 0;
  turn: Turn | undefined;
  target: 0 | 1 = 0;
  duration = 0;
  clock = 0;
  passes: Iterator<Pass> | undefined;
  finish: (() => void) | undefined;
  queued: Queued | undefined;
  /** Set when a play reached its end, so `keep: false` can clear the styles once the turn is done. */
  ended = false;
  /** Set by the element's view. Only a looping play pauses on it. */
  offScreen = false;
  timeline!: Timeline;
  timing!: Timing;

  constructor(readonly style: CSSStyleDeclaration) {}

  isBusy(): boolean {
    return this.passes !== undefined || this.turn !== undefined;
  }

  write(value: number): void {
    writeProgress(this.style, this.timeline, value);
    this.progress = value;
  }

  show(progress: number): void {
    this.turn = undefined;
    this.speed = 0;
    this.playAt = progress;
    this.write(progress);
  }

  cancel(): void {
    const finish = this.finish;
    this.passes = undefined;
    this.finish = undefined;
    this.turn = undefined;
    dropQueued(this);
    finish?.();
  }

  step(now: number): boolean {
    if (this.offScreen && this.timing.loop !== undefined) return false;
    if (this.passes && now >= this.clock) moveTo(this, now);
    present(this, now);
    if (this.isBusy()) return false;
    if (this.ended) this.settle();
    this.ended = false;
    return true;
  }

  settle(): void {
    if (this.target !== 1 || this.timing.keep) return;
    for (const prop of this.timeline.props) this.style.removeProperty(prop);
  }
}
