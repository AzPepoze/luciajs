import { store, type Store } from "lucia";

// Counts how often things run, so tests can check the update count.
export const probe = { reads: 0, tones: 0, diamond: 0 };

export const count = store(0);
export const label = store("cell");

export const tone = store.from(() => {
  probe.tones++;
  return count.value % 2 ? "odd" : "even";
});

// Used in a text binding: each run of that binding is one DOM update.
export function tick(value: Store<number>): number {
  probe.reads++;
  return value.value;
}

// Shared by every table row in the components scenario.
export const rowValue = store(0);

export const base = store(1);
const left = store.from(() => base.value + 1);
const right = store.from(() => base.value * 2);

export const diamond = store.from(() => {
  probe.diamond++;
  return left.value + right.value;
});

export function resetStore(): void {
  count.value = 0;
  label.value = "cell";
  base.value = 1;
  rowValue.value = 0;
  probe.reads = 0;
  probe.tones = 0;
  probe.diamond = 0;
}
