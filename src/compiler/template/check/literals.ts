export interface Span {
  from: number;
  to: number;
}

/** One key of an object literal. `valueOffset` is undefined for a shorthand entry such as `{ style }`. */
export interface Entry {
  key: string;
  keyOffset: number;
  valueOffset: number | undefined;
}

const WHITESPACE = /\s/;
const KEY = /[\w$.]+/y;
const OPENERS = "([{";
const CLOSERS = ")]}";

export function skipSpace(source: string, from: number): number {
  let i = from;
  while (i < source.length && WHITESPACE.test(source.charAt(i))) i++;
  return i;
}

/** The index of the quote that closes the string opened at `start`. */
export function skipString(source: string, start: number): number {
  const quote = source.charAt(start);
  for (let i = start + 1; i < source.length; i++) {
    if (source.charAt(i) === "\\") i++;
    else if (source.charAt(i) === quote) return i;
  }
  return source.length;
}

/** The comma-separated items of the array or object literal whose opening bracket is at `open`. */
export function listItems(source: string, open: number): Span[] {
  const items: Span[] = [];
  let depth = 0;
  let from = open + 1;
  for (let i = open + 1; i < source.length; i++) {
    const ch = source.charAt(i);
    if (ch === "'" || ch === '"' || ch === "`") {
      i = skipString(source, i);
    } else if (OPENERS.includes(ch)) {
      depth++;
    } else if (CLOSERS.includes(ch)) {
      if (depth === 0) return withSpan(source, from, i, items);
      depth--;
    } else if (ch === "," && depth === 0) {
      withSpan(source, from, i, items);
      from = i + 1;
    }
  }
  return items;
}

/** Adds the span from `from` to `to`, without its surrounding space, when it is not empty. */
function withSpan(source: string, from: number, to: number, items: Span[]): Span[] {
  const start = skipSpace(source, from);
  let end = to;
  while (end > start && WHITESPACE.test(source.charAt(end - 1))) end--;
  if (end > start) items.push({ from: start, to: end });
  return items;
}

/** The keys of the object literal whose opening brace is at `open`. Spread entries are skipped. */
export function objectEntries(source: string, open: number): Entry[] {
  const entries: Entry[] = [];
  for (const item of listItems(source, open)) {
    const entry = entryOf(source, item.from);
    if (entry) entries.push(entry);
  }
  return entries;
}

function entryOf(source: string, from: number): Entry | undefined {
  if (source.startsWith("...", from)) return undefined;
  let i = from;
  let key: string;
  if (source.charAt(i) === "'" || source.charAt(i) === '"') {
    const end = skipString(source, i);
    key = source.slice(i + 1, end);
    i = end + 1;
  } else {
    KEY.lastIndex = i;
    const match = KEY.exec(source);
    if (!match) return undefined;
    key = match[0];
    i += key.length;
  }
  const colon = skipSpace(source, i);
  if (source.charAt(colon) !== ":") return { key, keyOffset: from, valueOffset: undefined };
  return { key, keyOffset: from, valueOffset: skipSpace(source, colon + 1) };
}
