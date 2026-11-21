const CONTEXT_LINES = 2;

/** Source lines around a 1-based line, with a caret under the error. Skips lines outside the source. */
export function plainFrame(source: string, line: number, column = 1, length = 1): string {
  const lines = source.split("\n");
  const errorRow = line - 1;
  const first = Math.max(0, errorRow - CONTEXT_LINES);
  const last = Math.min(lines.length - 1, errorRow + CONTEXT_LINES);
  const width = String(last + 1).length;
  const rows: string[] = [];
  for (let row = first; row <= last; row++) {
    rows.push(`${String(row + 1).padStart(width)} | ${lines[row]}`);
    if (row === errorRow) {
      const pad = " ".repeat(Math.max(0, column - 1));
      const tildes = "~".repeat(Math.max(0, length - 1));
      rows.push(`${" ".repeat(width)} | ${pad}^${tildes}`);
    }
  }
  return rows.join("\n");
}
