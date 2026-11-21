import { animateDefault } from "../../options/defaults.ts";
import type { EaseStyle } from "../../modes/easing.ts";
import type { Keyframes } from "../../options/keyframes.ts";
import { readDefault, readKey } from "../../options/keyform.ts";
import { startPlaying, type Playable } from "../../play/loop.ts";
import type { Ease } from "../../modes/modes.ts";
import type { Space } from "./shrink-box.ts";
import { closeLift, openSpace, removePlaceholder, type Lift } from "./shrink-lift.ts";

export interface ShrinkSpec {
  duration: number;
  delay: number;
  keyframes: Keyframes;
}

interface Reopen {
  from: number;
  begin: number;
  duration: number;
}

// Closes one leave's space. Its reads were taken when the leave started.
export class Closer implements Playable {
  private finish: () => void = () => {};
  private lift: Lift | undefined;
  private closed = 0;
  private reopen: Reopen | undefined;
  private finished = false;
  private begin = 0;
  private readonly easeStyle: EaseStyle;
  private readonly ease: Ease;

  constructor(
    private readonly el: HTMLElement,
    private readonly space: Space,
    private readonly spec: ShrinkSpec,
  ) {
    [this.easeStyle, this.ease] = easingOf(spec.keyframes);
  }

  start(): Promise<void> {
    this.begin = performance.now();
    return new Promise((resolve) => {
      this.finish = resolve;
      startPlaying(this);
    });
  }

  /** Reopens the space from where it is, so the siblings slide back without a jump. */
  cancel(): void {
    if (this.finished || this.reopen) return;
    if (this.lift === undefined) {
      this.end();
      return;
    }
    this.reopen = {
      from: this.closed,
      begin: performance.now(),
      duration: this.spec.duration * this.closed,
    };
  }

  step(now: number): boolean {
    if (this.finished) return true;
    this.lift ??= openSpace(this.el, this.space);
    if (this.reopen) return this.stepReopen(now, this.reopen);
    const progress = clampedProgress(now - this.begin - this.spec.delay, this.spec.duration);
    this.closed = this.ease(this.easeStyle, progress);
    this.write();
    if (progress < 1) return false;
    removePlaceholder(this.lift);
    this.end();
    return true;
  }

  private stepReopen(now: number, reopen: Reopen): boolean {
    const progress = clampedProgress(now - reopen.begin, reopen.duration);
    this.closed = reopen.from * (1 - this.ease(this.easeStyle, progress));
    this.write();
    if (progress < 1) return false;
    this.closed = 0;
    closeLift(this.el, this.lift!);
    this.end();
    return true;
  }

  private write(): void {
    const { axis, along, margin, gap } = this.space;
    const open = 1 - this.closed;
    const style = this.lift!.placeholder.style;
    style.setProperty(axis.size, `${along * open}px`);
    style.setProperty(`margin-${axis.start}`, `${margin[axis.start] * open}px`);
    style.setProperty(`margin-${axis.end}`, `${margin[axis.end] * open - gap * this.closed}px`);
  }

  private end(): void {
    this.finished = true;
    this.finish();
  }
}

function clampedProgress(elapsed: number, duration: number): number {
  if (duration <= 0) return 1;
  return Math.min(1, Math.max(0, elapsed / duration));
}

/** The ease of the last key, which closes the space. */
function easingOf(keyframes: Keyframes): [EaseStyle, Ease] {
  const [easeStyle, ease] = readKey(
    keyframes[1]!,
    readDefault(keyframes.default),
    animateDefault(),
  );
  return [easeStyle, ease];
}
