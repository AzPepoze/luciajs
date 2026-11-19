import { batch } from "lucia";
import { attachCells, createTarget, detachCells } from "../cells.ts";
import { formatMs, timed, type Result } from "../report.ts";
import { count } from "../store.ts";

const CELLS = 2000;
const WRITES = 1000;

function writeCount(from: number, writes: number): void {
  for (let i = 1; i <= writes; i++) count.value = from + i;
}

export async function run(): Promise<Result[]> {
  const target = createTarget("ul");
  const instances = attachCells(target, CELLS);
  const outsideMs = timed(() => writeCount(0, WRITES));
  const insideMs = timed(() => batch(() => writeCount(WRITES, WRITES)));
  detachCells(instances);
  target.remove();
  return [
    { name: `${WRITES} writes, outside batch (${CELLS} cells)`, value: formatMs(outsideMs) },
    { name: `${WRITES} writes, inside batch (${CELLS} cells)`, value: formatMs(insideMs) },
  ];
}
