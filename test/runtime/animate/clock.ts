import { afterAll, afterEach, beforeEach } from "bun:test";

type Frame = (time: number) => void;

const FRAME_MS = 16;
const MAX_FLUSH_FRAMES = 1000;

let now = 0;
let frames: Frame[] = [];
let reducedMotion = false;
const resetHooks: Array<() => void> = [];
const originals = {
  requestAnimationFrame: globalThis.requestAnimationFrame,
  cancelAnimationFrame: globalThis.cancelAnimationFrame,
  now: performance.now,
  matchMedia: globalThis.matchMedia,
};

/**
 * Replaces the frame clock and performance.now. Call once at the top of a test file.
 * After each test the clock runs the hooks from `onReset`, then plays out the frames
 * left in the queue, so the shared frame loop is idle for the next test. The real
 * functions come back after the file.
 */
export function useFakeClock(): void {
  beforeEach(() => {
    now = 0;
    globalThis.requestAnimationFrame = ((callback: Frame) => {
      frames.push(callback);
      return frames.length;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame;
    performance.now = () => now;
    globalThis.matchMedia = (() => ({ matches: reducedMotion })) as unknown as typeof matchMedia;
  });
  afterEach(() => {
    for (const hook of resetHooks.splice(0)) hook();
    flushFrames();
    reducedMotion = false;
  });
  afterAll(() => {
    globalThis.requestAnimationFrame = originals.requestAnimationFrame;
    globalThis.cancelAnimationFrame = originals.cancelAnimationFrame;
    performance.now = originals.now;
    globalThis.matchMedia = originals.matchMedia;
  });
}

/** Runs `hook` after the test, before the queue is flushed. Use it to cancel anything left running. */
export function onReset(hook: () => void): void {
  resetHooks.push(hook);
}

export function setReducedMotion(value: boolean): void {
  reducedMotion = value;
}

/** Number of frame callbacks waiting to run. */
export function pendingFrames(): number {
  return frames.length;
}

/** Moves the clock forward and runs one frame per step, the way the browser would. */
export function advance(ms: number, step = FRAME_MS): void {
  const end = now + ms;
  while (now < end) {
    now = Math.min(end, now + step);
    runFrames();
  }
}

function runFrames(): void {
  const due = frames;
  frames = [];
  for (const frame of due) frame(now);
}

function flushFrames(): void {
  for (let i = 0; frames.length > 0; i++) {
    if (i >= MAX_FLUSH_FRAMES) throw new Error("frames never settled; cancel loops with onReset");
    now += FRAME_MS;
    runFrames();
  }
}
