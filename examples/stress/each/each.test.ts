import { afterEach, describe, expect, test } from "bun:test";
import { attach, type Instance } from "lucia";
import { createTarget } from "../cells.ts";
import { ROWS } from "./main.ts";
import List from "./List.lucia";
import { makeRows, rows, shuffled } from "./rows.ts";

let instance: Instance | null = null;
let target: HTMLElement | null = null;

afterEach(async () => {
  await instance?.detach();
  target?.remove();
  instance = null;
  target = null;
  rows.value = [];
});

function mount(): HTMLElement {
  target = createTarget("div");
  instance = attach(List, target);
  return target;
}

function itemOf(root: HTMLElement, id: number): HTMLElement {
  return root.querySelector<HTMLElement>(`[data-id="${id}"]`)!;
}

describe("EACH with many rows", () => {
  test(`creates ${ROWS} rows in order`, () => {
    const root = mount();
    rows.value = makeRows(ROWS);
    const items = root.querySelectorAll("li");
    expect(items.length).toBe(ROWS);
    expect(items[0]!.textContent).toBe("0. Row 0");
    expect(items[ROWS - 1]!.textContent).toBe(`${ROWS - 1}. Row ${ROWS - 1}`);
  });

  test("reversing moves the existing rows and updates their index", () => {
    const root = mount();
    rows.value = makeRows(ROWS);
    const before = itemOf(root, 4);

    rows.value = [...rows.value].reverse();
    expect(itemOf(root, 4)).toBe(before);
    expect(root.querySelector("li")!.textContent).toBe(`0. Row ${ROWS - 1}`);
    expect(before.textContent).toBe(`${ROWS - 5}. Row 4`);
  });

  test("shuffling keeps every row element", () => {
    const root = mount();
    rows.value = makeRows(ROWS);
    const before = new Map(
      [...root.querySelectorAll<HTMLLIElement>("li")].map((item) => [item.dataset.id, item]),
    );

    rows.value = shuffled(rows.value);
    const after = root.querySelectorAll("li");
    expect(after.length).toBe(ROWS);
    for (const item of after) expect(item).toBe(before.get(item.dataset.id)!);
  });

  test("keyed reuse keeps rows whose objects stay and adds the new ones", () => {
    const root = mount();
    rows.value = makeRows(ROWS);
    const kept = rows.value.filter((row) => row.id % 2 === 0);
    const elementById = new Map(
      [...root.querySelectorAll<HTMLElement>("li")].map((item) => [item.dataset.id, item]),
    );

    rows.value = [...kept, ...makeRows(ROWS / 2, ROWS)];
    const afterById = new Map(
      [...root.querySelectorAll<HTMLElement>("li")].map((item) => [item.dataset.id, item]),
    );
    expect(afterById.size).toBe(ROWS);
    for (const row of kept)
      expect(afterById.get(String(row.id))).toBe(elementById.get(String(row.id))!);
    expect(itemOf(root, ROWS).textContent).toBe(`${kept.length}. Row ${ROWS}`);
  });

  test("removing every row leaves no list items", () => {
    const root = mount();
    rows.value = makeRows(ROWS);
    rows.value = [];
    expect(root.querySelectorAll("li").length).toBe(0);
  });
});
