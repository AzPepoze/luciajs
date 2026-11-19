/** 1-based line that `index` falls on. */
export function lineAt(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

/** 1-based column of `index`, counted from the start of its line. */
export function columnAt(source: string, index: number): number {
  return index - source.slice(0, index).lastIndexOf("\n");
}

/** The index where each line starts. Built once per source, then searched with `lineIndexAt`. */
export function lineStarts(source: string): number[] {
  const starts = [0];
  for (let i = 0; i < source.length; i++) if (source[i] === "\n") starts.push(i + 1);
  return starts;
}

/** 0-based index of the line that holds `index`, from the starts of `lineStarts`. */
export function lineIndexAt(starts: readonly number[], index: number): number {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (starts[mid]! <= index) low = mid;
    else high = mid - 1;
  }
  return low;
}
