import { scenarios } from "../scenarios.ts";
import type { Result } from "../report.ts";

const status = document.getElementById("status")!;
const rows = document.getElementById("results")!;

function row(result: Result): HTMLTableRowElement {
  const tr = document.createElement("tr");
  for (const text of [result.name, result.value]) {
    const cell = document.createElement("td");
    cell.textContent = text;
    tr.append(cell);
  }
  return tr;
}

async function runAll(): Promise<void> {
  const results: Result[] = [];
  for (const run of scenarios) {
    results.push(...(await run()));
    rows.replaceChildren(...results.map(row));
  }
  status.textContent = "Done";
  console.table(results);
}

runAll();
