/** 1-based line that `index` falls on. */
export function lineAt(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

/** 1-based column of `index`, counted from the start of its line. */
export function columnAt(source: string, index: number): number {
  return index - source.slice(0, index).lastIndexOf("\n");
}
