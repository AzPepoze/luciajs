import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { watch } from "@runtime/store/graph.ts";
import { store } from "@runtime/store/store.ts";
import Watch from "../dom/fixtures/Watch.lucia";
import { events } from "../dom/fixtures/log.ts";
import { resetStore, state } from "../dom/fixtures/state.ts";
import { mount, resetMounts, unmount } from "../dom/fixtures/mount.ts";

beforeEach(resetStore);
afterEach(resetMounts);

describe("store.onUpdate", () => {
  test("runs once right away", () => {
    const count = store(0);
    let runs = 0;
    store.onUpdate(function countRuns() {
      runs++;
      count.value;
    });
    expect(runs).toBe(1);
  });

  test("runs again only when a store it read changes", () => {
    const read = store(0);
    const unrelated = store(0);
    let runs = 0;
    store.onUpdate(function readOne() {
      runs++;
      read.value;
    });

    unrelated.value = 1;
    expect(runs).toBe(1);

    read.value = 1;
    expect(runs).toBe(2);
  });

  test("reruns when a read store it read changes", () => {
    const base = store(1);
    const doubled = store.from(() => base.value * 2);
    const seen: number[] = [];
    store.onUpdate(function recordDoubled() {
      seen.push(doubled.value);
    });

    base.value = 2;
    expect(seen).toEqual([2, 4]);
  });

  test("re-tracks reads on each run, so a branch not taken is not read", () => {
    const useA = store(true);
    const a = store("a");
    const b = store("b");
    let runs = 0;
    store.onUpdate(function pickOne() {
      runs++;
      return useA.value ? a.value : b.value;
    });

    b.value = "B";
    expect(runs).toBe(1);

    useA.value = false;
    expect(runs).toBe(2);

    a.value = "A2";
    expect(runs).toBe(2);
  });

  test("stop function ends the updates", () => {
    const count = store(0);
    let runs = 0;
    const stop = store.onUpdate(function countRuns() {
      runs++;
      count.value;
    });

    stop();
    count.value = 1;
    expect(runs).toBe(1);
  });

  test("writes made by its function reach a dependent watcher once", () => {
    const trigger = store(0);
    const first = store(0);
    const second = store(0);
    const third = store(0);
    store.onUpdate(function writeThree() {
      const next = trigger.value;
      first.value = next;
      second.value = next;
      third.value = next;
    });
    let runs = 0;
    const stop = watch(() => {
      runs++;
      first.value;
      second.value;
      third.value;
    });
    expect(runs).toBe(1);

    trigger.value = 1;
    expect(runs).toBe(2);
    stop();
  });

  test("stops when its component is removed", () => {
    events.length = 0;
    const el = document.createElement("div");
    document.body.append(el);
    const instance = mount(Watch, el);
    expect(events).toEqual(["count 0"]);

    state.count.value = 1;
    expect(events).toEqual(["count 0", "count 1"]);

    unmount(instance);
    state.count.value = 2;
    expect(events).toEqual(["count 0", "count 1"]);
  });
});
