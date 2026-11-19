import { untrack, watch } from "../../store/graph.ts";
import { store, type Store } from "../../store/store.ts";
import type { Cleanup } from "../bindings.ts";
import type { Leave } from "../leave.ts";
import { mountBefore, moveBefore, type Mount } from "./mount.ts";
import { Outlet } from "./outlet.ts";

export type RowRender = (
  item: unknown,
  index: Store<number> | undefined,
  cleanups: Cleanup[],
  leaves: Leave[],
) => DocumentFragment;

export interface EachSpec {
  read: () => unknown;
  render: RowRender;
  /** Defaults to the item itself. The key sees the index as a number. */
  key?: (item: unknown, index: number) => unknown;
  /** Whether the rows need a live index store. */
  indexed: boolean;
}

interface Row extends Mount {
  item: unknown;
  key: unknown;
  index: Store<number> | undefined;
}

export function listOf(value: unknown): readonly unknown[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : Array.from(value as Iterable<unknown>);
}

/** Keyed rows between a marker and the nodes that follow it. Rows with the same key are moved, never re-rendered. */
class EachBlock {
  private rows: Row[] = [];
  private readonly outlet: Outlet;

  constructor(
    private readonly marker: Comment,
    private readonly spec: EachSpec,
    leaves: Leave[],
  ) {
    this.outlet = new Outlet(leaves);
  }

  update(items: readonly unknown[]): void {
    untrack(() => this.reconcile(items));
  }

  dispose(): void {
    this.outlet.disposeAll();
  }

  private keyOf(item: unknown, index: number): unknown {
    return this.spec.key ? this.spec.key(item, index) : item;
  }

  private reconcile(items: readonly unknown[]): void {
    const reusable = new Map<unknown, Row>();
    for (const row of this.rows) reusable.set(row.key, row);
    const seen = new Set<unknown>();
    const keys: unknown[] = new Array(items.length);
    const plan: (Row | undefined)[] = new Array(items.length);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const key = this.keyOf(item, i);
      if (seen.has(key)) throw new Error(`EACH keys must be unique, but ${String(key)} appears twice`);
      seen.add(key);
      keys[i] = key;
      const row = reusable.get(key);
      reusable.delete(key);
      if (row && row.item === item) {
        plan[i] = row;
      } else {
        if (row) this.outlet.retire(row);
        plan[i] = undefined;
      }
    }
    for (const row of reusable.values()) this.outlet.retire(row);
    this.place(items, keys, plan);
  }

  /** Walks from the end so each row is placed before the row that follows it. */
  private place(items: readonly unknown[], keys: unknown[], plan: (Row | undefined)[]): void {
    const next: Row[] = new Array(items.length);
    let anchor: Node = this.marker;
    for (let i = items.length - 1; i >= 0; i--) {
      const kept = plan[i];
      const row = kept ? this.keep(kept, i, anchor) : this.create(items[i], keys[i], i, anchor);
      next[i] = row;
      anchor = row.start;
    }
    this.rows = next;
  }

  private keep(row: Row, index: number, anchor: Node): Row {
    if (row.index) row.index.value = index;
    if (row.end.nextSibling !== anchor) moveBefore(row, anchor);
    return row;
  }

  private create(item: unknown, key: unknown, index: number, anchor: Node): Row {
    const cleanups: Cleanup[] = [];
    const leaves: Leave[] = [];
    const indexStore = this.spec.indexed ? store(index) : undefined;
    const fragment = this.spec.render(item, indexStore, cleanups, leaves);
    const row: Row = { ...mountBefore(anchor, fragment, cleanups, leaves), item, key, index: indexStore };
    this.outlet.track(row);
    return row;
  }
}

/** Renders one row per item. The list is read in a watch, so a new array or store value reconciles the rows. */
export function bindEach(marker: Comment, spec: EachSpec, cleanups: Cleanup[], leaves: Leave[]): void {
  const block = new EachBlock(marker, spec, leaves);
  cleanups.push(
    watch(() => block.update(listOf(spec.read()))),
    () => block.dispose(),
  );
}
