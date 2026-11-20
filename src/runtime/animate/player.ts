import type { Timing } from "./options.ts";
import { MIDWAY } from "./midway-modes.ts";
import { forwardPasses, LEAVE, type Pass } from "./passes.ts";
import { startPlaying, type Playable } from "./loop.ts";
import { startingFrom, writeProgress, type Timeline } from "./timeline.ts";
import { startTurn, turnValue, type Turn } from "./turn.ts";

/** Where a new play takes over from the running one. `restart` snaps to the new play's own start. */
interface Switch {
  from: number;
  speed: number;
  restart: boolean;
}

/** A request waiting for the running play (MIDWAY.FINISH). Only the last one runs, and every waiter resolves with it. */
interface Queued {
  passes: Iterable<Pass>;
  waiters: Array<() => void>;
}

/** Moves one element through its timeline. How a request meets a running play is set by `midway`. */
export class Player implements Playable {
  /** The value last written to the element. */
  private progress = 0;
  /** Where the current play is on its own timeline. A turn shows a blend of this and the old motion. */
  private playAt = 0;
  /** Progress per ms of the last written value. Tracked every frame, so a turn can continue it. */
  private speed = 0;
  private at = 0;
  private turn: Turn | undefined;
  private target: 0 | 1 = 0;
  private duration = 0;
  private clock = 0;
  private passes: Iterator<Pass> | undefined;
  private finish: (() => void) | undefined;
  private queued: Queued | undefined;
  /** Set when a play reached its end, so `keep: false` can clear the styles once the turn is done. */
  private ended = false;
  /** Set by the element's view. Only a looping play pauses on it. */
  private offScreen = false;
  private timeline!: Timeline;
  private timing!: Timing;

  constructor(private readonly style: CSSStyleDeclaration) {}

  /** Swaps in the timeline and timing for the next play. The progress is kept. */
  load(timeline: Timeline, timing: Timing): void {
    this.timeline = timeline;
    this.timing = timing;
  }

  show(progress: number): void {
    this.turn = undefined;
    this.speed = 0;
    this.playAt = progress;
    this.write(progress);
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
    if (!this.isBusy()) return this.startPlay(passes, undefined);
    const midway = this.timing.midway.play;
    if (midway === MIDWAY.IGNORE) return Promise.resolve();
    if (midway === MIDWAY.FINISH) return this.queue(passes);
    if (midway === MIDWAY.SKIP) return this.skipThen(passes);
    if (midway === MIDWAY.RESTART) return this.restartWith(passes);
    return this.turnInto(passes);
  }

  cancel(): void {
    const finish = this.finish;
    this.passes = undefined;
    this.finish = undefined;
    this.turn = undefined;
    this.dropQueued();
    finish?.();
  }

  /** A looping play that is off screen writes nothing. Its clock keeps running, so it catches up when shown. */
  setOffScreen(offScreen: boolean): void {
    this.offScreen = offScreen;
  }

  step(now: number): boolean {
    if (this.offScreen && this.timing.loop !== undefined) return false;
    if (this.passes && now >= this.clock) this.moveTo(now);
    this.present(now);
    if (this.isBusy()) return false;
    if (this.ended) this.settle();
    this.ended = false;
    return true;
  }

  private isBusy(): boolean {
    return this.passes !== undefined || this.turn !== undefined;
  }

  private write(value: number): void {
    writeProgress(this.style, this.timeline, value);
    this.progress = value;
  }

  /** The new play starts from the current look, with a turn if the switch asks for one. */
  private turnInto(passes: Iterable<Pass>): Promise<void> {
    const switching: Switch = { from: this.progress, speed: this.speed, restart: false };
    this.cancel();
    return this.startPlay(passes, switching);
  }

  /** The running play jumps to its end, then the new play starts from there. */
  private skipThen(passes: Iterable<Pass>): Promise<void> {
    const end = this.target;
    this.cancel();
    this.show(end);
    return this.startPlay(passes, { from: end, speed: 0, restart: false });
  }

  private restartWith(passes: Iterable<Pass>): Promise<void> {
    this.cancel();
    return this.startPlay(passes, { from: this.playAt, speed: 0, restart: true });
  }

  private queue(passes: Iterable<Pass>): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.queued) {
        this.queued.passes = passes;
        this.queued.waiters.push(resolve);
      } else {
        this.queued = { passes, waiters: [resolve] };
      }
    });
  }

  private dropQueued(): void {
    const queued = this.queued;
    this.queued = undefined;
    queued?.waiters.forEach((resolve) => resolve());
  }

  private startPlay(
    passes: Iterable<Pass>,
    switching: Switch | undefined,
    at = performance.now(),
  ): Promise<void> {
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
    this.ended = false;
    this.at = at;
    this.playAt = switching?.from ?? this.progress;
    if (switching?.restart) this.show(first.value.to === 1 ? 0 : 1);
    this.begin(first.value, this.at);
    if (switching && !switching.restart) this.turnFrom(switching.from, switching.speed);
    startPlaying(this);
    return done;
  }

  /** Starts the turn for a switch. STOP holds the new play until the element has come to rest. */
  private turnFrom(from: number, speed: number): void {
    this.turn = startTurn(this.timing.midway, from, speed);
    if (this.turn?.kind !== "stop") return;
    this.playAt = from + (speed * this.turn.duration) / 2;
    this.clock = this.at + this.turn.duration;
  }

  /** Moves the play to `now`, and ends the pass when it reaches its target. */
  private moveTo(now: number): void {
    const elapsed = now - this.clock;
    const used = Math.abs(this.target - this.playAt) * this.duration;
    this.clock = now;
    this.playAt = advance(this.playAt, this.target, elapsed, this.duration);
    if (this.playAt === this.target) this.nextPass(now - Math.max(0, elapsed - used));
  }

  /** Writes this frame's progress, and tracks the speed from it. */
  private present(now: number): void {
    const dt = now - this.at;
    this.at = now;
    const value = this.turn ? this.turnedValue(this.turn, dt) : this.playAt;
    if (dt > 0) this.speed = (value - this.progress) / dt;
    this.write(value);
  }

  private turnedValue(turn: Turn, dt: number): number {
    turn.age += dt;
    if (turn.age < turn.duration) return turnValue(turn, this.playAt);
    this.turn = undefined;
    return this.playAt;
  }

  /** `now` is when the finished pass really ended, so time left over in the frame carries to the next one. */
  private nextPass(endedAt: number): void {
    const next = this.passes!.next();
    if (next.done) this.endPlay(endedAt);
    else this.begin(next.value, endedAt);
  }

  /** The last pass ended. A queued request (MIDWAY.FINISH) starts now, from where this play ended. */
  private endPlay(endedAt: number): void {
    const finish = this.finish;
    this.passes = undefined;
    this.finish = undefined;
    this.ended = true;
    finish?.();
    this.startQueued(endedAt);
  }

  private startQueued(endedAt: number): void {
    const queued = this.queued;
    if (!queued) return;
    this.queued = undefined;
    const from = this.turn ? this.progress : this.playAt;
    const done = this.startPlay(
      queued.passes,
      { from, speed: this.speed, restart: false },
      endedAt,
    );
    void done.then(() => queued.waiters.forEach((resolve) => resolve()));
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
