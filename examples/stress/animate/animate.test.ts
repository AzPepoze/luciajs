import { afterEach, describe, expect, test } from "bun:test";
import { attach, type Instance } from "lucia";
import { createTarget } from "../cells.ts";
import Tile from "./Tile.lucia";
import { attachTiles, DURATION, TILES, wait } from "./main.ts";

const LEAVE_MARGIN_MS = 200;

let targets: HTMLElement[] = [];

afterEach(() => {
  for (const target of targets) target.remove();
  targets = [];
});

function newTarget(): HTMLElement {
  const target = createTarget("ul");
  targets.push(target);
  return target;
}

describe("animate on many elements", () => {
  test("leave keeps the tile until its animation ends, then removes it", async () => {
    const target = newTarget();
    const instance: Instance = attach(Tile, target);
    const item = target.querySelector("li")!;

    const left: Promise<void> = instance.detach();
    expect(item.isConnected).toBe(true);

    await left;
    expect(item.isConnected).toBe(false);
    expect(target.childNodes.length).toBe(0);
  });

  test("the leave takes about the animation duration after a finished enter", async () => {
    const target = newTarget();
    const instance = attach(Tile, target);
    await wait(DURATION + LEAVE_MARGIN_MS);
    const start = performance.now();
    await instance.detach();
    expect(performance.now() - start).toBeGreaterThanOrEqual(DURATION - LEAVE_MARGIN_MS);
  });

  test(`attaches and removes ${TILES} tiles`, async () => {
    const target = newTarget();
    const instances = attachTiles(target, TILES);
    expect(target.querySelectorAll("li").length).toBe(TILES);

    await Promise.all(instances.map((instance) => instance.detach()));
    expect(target.childNodes.length).toBe(0);
  });

  test("a finished enter leaves both animations at their end state", async () => {
    const target = newTarget();
    attach(Tile, target);
    await wait(DURATION + LEAVE_MARGIN_MS);
    const item = target.querySelector<HTMLElement>("li")!;
    expect(item.style.opacity).toBe("1");
    expect(item.style.getPropertyValue("translate")).toBe("0px 0px");
  });
});
