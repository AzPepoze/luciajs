import { afterEach, describe, expect, test } from "bun:test";
import { attach, type Instance } from "lucia";
import { attachCells, createTarget, detachCells } from "../cells.ts";
import { count, resetStore } from "../store.ts";
import Cell from "./Cell.lucia";

const CYCLES = 500;
const CELLS = 2000;

let instances: Instance[] = [];
let targets: HTMLElement[] = [];

afterEach(() => {
  detachCells(instances);
  instances = [];
  for (const target of targets) target.remove();
  targets = [];
  resetStore();
});

function newTarget(): HTMLElement {
  const target = createTarget("ul");
  targets.push(target);
  return target;
}

describe("attach and detach", () => {
  test(`attaches and detaches a cell ${CYCLES} times without leaving nodes`, () => {
    for (let i = 0; i < CYCLES; i++) {
      const target = newTarget();
      const instance = attach(Cell, target);
      const item = target.querySelector("li")!;
      expect(target.childNodes.length).toBe(1);

      instance.detach();
      expect(target.childNodes.length).toBe(0);
      expect(item.isConnected).toBe(false);
    }
  });

  test("updates after detach do not change the detached nodes", () => {
    const target = newTarget();
    const instance = attach(Cell, target);
    const item = target.querySelector("li")!;
    instance.detach();

    const before = item.outerHTML;
    count.value = 99;
    expect(item.outerHTML).toBe(before);
  });

  test(`attaches ${CELLS} cells and detaches them all`, () => {
    const target = newTarget();
    instances = attachCells(target, CELLS);
    expect(target.querySelectorAll("li").length).toBe(CELLS);

    detachCells(instances);
    instances = [];
    expect(target.childNodes.length).toBe(0);
  });
});
