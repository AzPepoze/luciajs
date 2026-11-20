import type { Store } from "lucia";

// Counts a number up to its target with an ease-out curve. Reduced motion jumps to the end.
export function countUp(value: Store<number>, target: number, duration = 1200): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    value.value = target;
    return;
  }
  const start = performance.now();

  function frame(now: number): void {
    const t = Math.min(1, (now - start) / duration);
    value.value = Math.round(target * (1 - (1 - t) ** 3));
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
