const CLOSER: Record<string, string> = { "(": ")", "[": "]", "{": "}" };

/** If a string or comment starts at `pos`, the index just past it. Otherwise `pos` itself. */
export function skipNonCode(src: string, pos: number): number {
  const ch = src[pos];
  if (ch === '"' || ch === "'" || ch === "`") return skipQuoted(src, pos, ch);
  if (ch === "/" && src[pos + 1] === "/") return endOfLine(src, pos);
  if (ch === "/" && src[pos + 1] === "*") return endOfComment(src, pos);
  return pos;
}

function skipQuoted(src: string, start: number, quote: string): number {
  let pos = start + 1;
  while (pos < src.length && src[pos] !== quote) pos += src[pos] === "\\" ? 2 : 1;
  return Math.min(pos + 1, src.length);
}

function endOfLine(src: string, start: number): number {
  const end = src.indexOf("\n", start);
  return end === -1 ? src.length : end;
}

function endOfComment(src: string, start: number): number {
  const end = src.indexOf("*/", start + 2);
  return end === -1 ? src.length : end + 2;
}

/** Given an opening bracket at `start`, the index just past its matching closer, or -1. */
export function groupEnd(src: string, start: number): number {
  const closers: string[] = [];
  let pos = start;
  while (pos < src.length) {
    const next = skipNonCode(src, pos);
    if (next !== pos) {
      pos = next;
      continue;
    }
    const ch = src[pos]!;
    if (CLOSER[ch]) closers.push(CLOSER[ch]);
    else if (ch === closers.at(-1) && closers.pop() !== undefined && closers.length === 0)
      return pos + 1;
    pos++;
  }
  return -1;
}
