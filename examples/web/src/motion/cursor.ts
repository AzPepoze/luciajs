import type { Variable } from "lucia";
import { spawnSparks, type Spark } from "./sparks.ts";

const TRAIL_GAP_MS = 45;
const trailTones = ["var(--pink)", "var(--lavender)", "var(--lemon)", "var(--mint)", "var(--sky)"];
const petalTones = ["var(--pink)", "var(--lavender)"];

// A sparkle trail on mouse pointers, and a petal burst on every press (touch included).
export function trackCursor(sparks: Variable<Spark[]>): () => void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  let lastTrail = 0;

  function onMove(event: PointerEvent): void {
    if (event.timeStamp - lastTrail < TRAIL_GAP_MS) return;
    lastTrail = event.timeStamp;
    spawnSparks(sparks, {
      kind: "star",
      tones: trailTones,
      count: 1,
      x: event.clientX,
      y: event.clientY,
      spread: 14,
      lift: -6,
      duration: 700,
    });
  }

  function onPress(event: PointerEvent): void {
    spawnSparks(sparks, {
      kind: "petal",
      tones: petalTones,
      count: 10,
      x: event.clientX,
      y: event.clientY,
      spread: 90,
      lift: 40,
      duration: 1400,
    });
  }

  if (fine) window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onPress, { passive: true });

  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onPress);
  };
}
