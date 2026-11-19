import { describe, expect, test } from "bun:test";
import { computed, signal } from "../../src/signal/signal.ts";
import { watch } from "../../src/signal/graph.ts";

describe("signal", () => {
  test("reads and writes a value", () => {
    const count = signal(1);
    expect(count.value).toBe(1);
    count.value = 2;
    expect(count.value).toBe(2);
    expect(count.peek()).toBe(2);
  });

  test("setting the same value (Object.is) does not notify", () => {
    const value = signal(NaN);
    let runs = 0;
    watch(() => {
      runs++;
      value.value;
    });
    value.value = NaN;
    expect(runs).toBe(1);
  });

  test("setting +0 to -0 is a change (Object.is)", () => {
    const value = signal(0);
    let runs = 0;
    watch(() => {
      runs++;
      value.value;
    });
    value.value = -0;
    expect(runs).toBe(2);
  });
});

describe("computed", () => {
  test("caches its value until an input changes", () => {
    const base = signal(2);
    let calls = 0;
    const double = computed(() => {
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
    const base = signal(1);
    let calls = 0;
    const plusOne = computed(() => {
      calls++;
      return base.value + 1;
    });
    expect(calls).toBe(0);
    expect(plusOne.value).toBe(2);
    expect(calls).toBe(1);
  });

  test("diamond: watch on d runs once per write to a", () => {
    const a = signal(1);
    const b = computed(() => a.value * 2);
    const c = computed(() => a.value + 1);
    const d = computed(() => b.value + c.value);
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
    const useA = signal(true);
    const a = signal("a");
    const b = signal("b");
    let calls = 0;
    const picked = computed(() => {
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
