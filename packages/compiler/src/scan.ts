const QUOTES = new Set(["'", '"', "`"]);

function skipString(src: string, start: number): number {
  const quote = src[start];
  let pos = start + 1;
  while (pos < src.length && src[pos] !== quote) pos += src[pos] === "\\" ? 2 : 1;
  return pos < src.length ? pos + 1 : -1;
}

/** Given `src[start] === "{"`, return the index just past the matching `}`, or -1 if it never closes. */
export function skipExpression(src: string, start: number): number {
  let depth = 0;
  let pos = start;
  while (pos < src.length) {
    const ch = src[pos]!;
    if (QUOTES.has(ch)) {
      pos = skipString(src, pos);
      if (pos === -1) return -1;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return pos + 1;
    pos++;
  }
  return -1;
}
