import { attachCells, createTarget, detachCells } from "../cells.ts";
import { formatMs, timed, type Result } from "../report.ts";
import { count } from "../store.ts";

const CELLS = 2000;
const WRITES = 1000;

function writeCount(writes: number): void {
  for (let i = 1; i <= writes; i++) count.value = i;
}

export async function run(): Promise<Result[]> {
  const target = createTarget("ul");
  const instances = attachCells(target, CELLS);
  const writeMs = timed(() => writeCount(WRITES));
  detachCells(instances);
  target.remove();
  return [{ name: `${WRITES} writes (${CELLS} cells)`, value: formatMs(writeMs) }];
}
