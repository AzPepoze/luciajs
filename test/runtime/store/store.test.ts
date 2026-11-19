import { describe, expect, test } from "bun:test";
import { store } from "@runtime/store/store.ts";
import { watch } from "@runtime/store/graph.ts";

describe("store", () => {
  test("reads and writes a value", () => {
    const count = store(1);
    expect(count.value).toBe(1);
    count.value = 2;
    expect(count.value).toBe(2);
    expect(count.peek()).toBe(2);
  });

  test("setting the same value (Object.is) does not notify", () => {
    const value = store(NaN);
    let runs = 0;
    watch(() => {
      runs++;
      value.value;
    });
    value.value = NaN;
    expect(runs).toBe(1);
  });

  test("setting +0 to -0 is a change (Object.is)", () => {
    const value = store(0);
    let runs = 0;
    watch(() => {
      runs++;
      value.value;
    });
    value.value = -0;
    expect(runs).toBe(2);
  });
});

describe("peek", () => {
  test("a store's peek does not subscribe the watcher", () => {
    const value = store(0);
    let runs = 0;
    watch(() => {
      runs++;
      value.peek();
    });
    value.value = 1;
    expect(runs).toBe(1);
  });

  test("a read store's peek does not subscribe the watcher, and still gives fresh values", () => {
    const base = store(1);
    const doubled = store.from(() => base.value * 2);
    const seen: number[] = [];
    let runs = 0;
    watch(() => {
      runs++;
      seen.push(doubled.peek());
    });
    base.value = 2;
    expect(runs).toBe(1);
    expect(doubled.peek()).toBe(4);
    expect(seen).toEqual([2]);
  });
});

describe("store.from", () => {
  test("caches its value until an input changes", () => {
    const base = store(2);
    let calls = 0;
    const double = store.from(() => {
      calls++;
      return base.value * 2;
    });
    expect(double.value).toBe(4);
    expect(double.value).toBe(4);
    expect(double.peek()).toBe(4);
    expect(calls).toBe(1);

    base.value = 3;
    expect(double.value).toBe(6);
    expect(double.value).toBe(6);
    expect(calls).toBe(2);
  });

  test("is lazy: does not run until read", () => {
    const base = store(1);
    let calls = 0;
    const plusOne = store.from(() => {
      calls++;
      return base.value + 1;
    });
    expect(calls).toBe(0);
    expect(plusOne.value).toBe(2);
    expect(calls).toBe(1);
  });

  test("diamond: watch on d runs once per write to a", () => {
    const a = store(1);
    const b = store.from(() => a.value * 2);
    const c = store.from(() => a.value + 1);
    const d = store.from(() => b.value + c.value);
    const seen: number[] = [];
    watch(() => {
      seen.push(d.value);
    });
    expect(seen).toEqual([4]);

    a.value = 2;
    expect(seen).toEqual([4, 7]);

    a.value = 3;
    expect(seen).toEqual([4, 7, 10]);
  });

  test("re-tracks dynamic dependencies on each run", () => {
    const useA = store(true);
    const a = store("a");
    const b = store("b");
    let calls = 0;
    const picked = store.from(() => {
      calls++;
      return useA.value ? a.value : b.value;
    });
    const seen: string[] = [];
    watch(() => {
      seen.push(picked.value);
    });
    expect(seen).toEqual(["a"]);

    // b is not a dependency while the branch reads a.
    b.value = "B";
    expect(seen).toEqual(["a"]);
    expect(calls).toBe(1);

    useA.value = false;
    expect(seen).toEqual(["a", "B"]);

    // a is no longer a dependency after the branch switch.
    a.value = "A2";
    expect(seen).toEqual(["a", "B"]);
    expect(calls).toBe(2);
  });
});
