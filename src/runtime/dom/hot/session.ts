export type Restore = Map<string, unknown>;

export interface Snapshot {
  id: string;
  values: Restore;
}

let pool: Map<string, Restore[]> | null = null;

/** True while a hot swap renders. Attach animations are skipped then. */
export function isSwapping(): boolean {
  return pool !== null;
}

/** `descendants` are the old child instances, in creation order. Their new twins take them in turn. */
export function beginSwap(descendants: Snapshot[]): void {
  pool = new Map();
  for (const { id, values } of descendants) {
    const list = pool.get(id);
    if (list) list.push(values);
    else pool.set(id, [values]);
  }
}

export function endSwap(): void {
  pool = null;
}

export function takeRestore(id: string): Restore | null {
  return pool?.get(id)?.shift() ?? null;
}
