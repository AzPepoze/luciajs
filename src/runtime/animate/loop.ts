export interface Playable {
  /** Advances to `now`; returns true when nothing is left to play. */
  step(now: number): boolean;
}

const playing = new Set<Playable>();
let frame: number | undefined;

/** One shared frame loop for every running animation. It stops when the last one finishes. */
export function startPlaying(item: Playable): void {
  playing.add(item);
  frame ??= requestAnimationFrame(tick);
}

function tick(): void {
  frame = undefined;
  const now = performance.now();
  for (const item of playing) {
    if (item.step(now)) playing.delete(item);
  }
  if (playing.size > 0 && frame === undefined) frame = requestAnimationFrame(tick);
}
