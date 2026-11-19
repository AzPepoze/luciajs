import { computed, signal, type Signal } from "lucia";

// Counts how often things run, so tests can check the update count.
export const probe = { reads: 0, tones: 0, diamond: 0 };

export const count = signal(0);
export const label = signal("cell");

export const tone = computed(() => {
  probe.tones++;
  return count.value % 2 ? "odd" : "even";
});

// Used in a text binding: each run of that binding is one DOM update.
export function tick(value: Signal<number>): number {
  probe.reads++;
  return value.value;
}

export const base = signal(1);
const left = computed(() => base.value + 1);
const right = computed(() => base.value * 2);

export const diamond = computed(() => {
  probe.diamond++;
  return left.value + right.value;
});

export function resetStore(): void {
  count.value = 0;
  label.value = "cell";
  base.value = 1;
  probe.reads = 0;
  probe.tones = 0;
  probe.diamond = 0;
}
