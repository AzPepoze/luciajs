import { attach, type Instance } from "lucia";
import { createTarget } from "../cells.ts";
import { formatMs, timed, type Result } from "../report.ts";
import Tile from "./Tile.lucia";

export const TILES = 2000;
export const DURATION = 300;

export function attachTiles(target: Element, total: number): Instance[] {
  const instances: Instance[] = [];
  for (let i = 0; i < total; i++) instances.push(attach(Tile, target));
  return instances;
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function countAtEnd(target: Element): number {
  return [...target.querySelectorAll<HTMLElement>("li")].filter(
    (item) => item.style.opacity === "1",
  ).length;
}

export async function run(): Promise<Result[]> {
  const target = createTarget("ul");
  let instances: Instance[] = [];
  const attachMs = timed(() => (instances = attachTiles(target, TILES)));
  await wait(DURATION + 100);
  const atEnd = countAtEnd(target);
  const leaveStart = performance.now();
  await Promise.all(instances.map((instance) => instance.detach()));
  const leaveMs = performance.now() - leaveStart;
  const left = target.childNodes.length;
  target.remove();
  return [
    { name: `Attach ${TILES} tiles, 3 animations each`, value: formatMs(attachMs) },
    { name: `Enter finished (opacity 1), of ${TILES}`, value: String(atEnd) },
    { name: `Leave ${TILES} tiles (waits for animation)`, value: formatMs(leaveMs) },
    { name: "Nodes left after leave", value: String(left) },
  ];
}
