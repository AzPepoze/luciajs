import type { Timing } from "./options.ts";
import { forwardPasses, LEAVE, type Pass } from "./passes.ts";
import { startPlaying, type Playable } from "./loop.ts";
import { startingFrom, writeProgress, type Timeline } from "./timeline.ts";

/** Moves one element through its timeline. A new run replaces the current one from where it is. */
export class Player implements Playable {
  private progress = 0;
  private target: 0 | 1 = 0;
  private duration = 0;
  private clock = 0;
  private passes: Iterator<Pass> | undefined;
  private finish: (() => void) | undefined;
  private timeline!: Timeline;
  private timing!: Timing;

  constructor(private readonly style: CSSStyleDeclaration) {}

  /** Swaps in the timeline and timing for the next play. The progress is kept. */
  load(timeline: Timeline, timing: Timing): void {
    this.timeline = timeline;
    this.timing = timing;
  }

  show(progress: number): void {
    this.progress = progress;
    writeProgress(this.style, this.timeline, progress);
  }

  /** Stops, then starts the next play from the styles the element has now, so nothing jumps. */
  startFromCurrent(): void {
    this.cancel();
    this.timeline = startingFrom(this.timeline, (prop) => this.style.getPropertyValue(prop));
    this.show(0);
  }

  seek(progress: number): void {
    this.cancel();
    this.show(progress);
  }

  forward(): Promise<void> {
    return this.run(forwardPasses(this.timing.loop));
  }

  backward(): Promise<void> {
    return this.run(LEAVE);
  }

  /** Plays the passes in order. The promise resolves when the last pass ends or the run is replaced. */
  run(passes: Iterable<Pass>): Promise<void> {
    this.cancel();
    const iterator = passes[Symbol.iterator]();
    const first = iterator.next();
    if (first.done) return Promise.resolve();
    if (prefersReducedMotion()) {
      this.target = first.value.to;
      this.show(this.target);
      this.settle();
      return Promise.resolve();
    }
    const done = new Promise<void>((resolve) => {
      this.finish = resolve;
    });
    this.passes = iterator;
    this.begin(first.value, performance.now());
    startPlaying(this);
    return done;
  }

  cancel(): void {
    const finish = this.finish;
    this.passes = undefined;
    this.finish = undefined;
    finish?.();
  }

  step(now: number): boolean {
    if (!this.passes) return true;
    if (now < this.clock) return false;
    const elapsed = now - this.clock;
    const used = Math.abs(this.target - this.progress) * this.duration;
    this.clock = now;
    this.show(advance(this.progress, this.target, elapsed, this.duration));
    if (this.progress !== this.target) return false;
    return this.nextPass(now - Math.max(0, elapsed - used));
  }

  /** `now` is when the finished pass really ended, so time left over in the frame carries to the next one. */
  private nextPass(endedAt: number): boolean {
    const next = this.passes!.next();
    if (next.done) {
      this.cancel();
      this.settle();
      return true;
    }
    this.begin(next.value, endedAt);
    return false;
  }

  /** With `keep: false`, a play that ends at 1 removes the styles it wrote. */
  private settle(): void {
    if (this.target !== 1 || this.timing.keep) return;
    for (const prop of this.timeline.props) this.style.removeProperty(prop);
  }

  /** Forward passes wait for the delay before they start moving. */
  private begin(pass: Pass, now: number): void {
    if (pass.from !== undefined) this.show(pass.from);
    this.target = pass.to;
    this.duration = this.timing.duration;
    this.clock = pass.to === 1 ? now + this.timing.delay : now;
  }
}

function advance(progress: number, target: number, elapsed: number, duration: number): number {
  if (duration <= 0) return target;
  const moved = progress + Math.sign(target - progress) * (elapsed / duration);
  return target > progress ? Math.min(moved, target) : Math.max(moved, target);
}

export function prefersReducedMotion(): boolean {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}
