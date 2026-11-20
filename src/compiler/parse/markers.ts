import { luciaError, type Values } from "../errors/create.ts";
import type { ErrorCodeName } from "../errors/codes.ts";
import { LuciaError } from "../errors.ts";
import { skipExpression } from "../utils/braces.ts";
import { columnAt, lineAt } from "../utils/position.ts";

export interface FallbackBlock {
  /** The markup inside <FALLBACK>, without its tags. */
  content: string;
  /** 1-based line where the content starts. */
  line: number;
}

export interface Markers {
  /** The markup without <FALLBACK> and <NOLAZY />. Their lines stay as line breaks. */
  markup: string;
  fallback: FallbackBlock | null;
  nolazy: boolean;
}

interface Tag {
  name: string;
  start: number;
  end: number;
  closing: boolean;
  selfClosing: boolean;
}

interface Span {
  start: number;
  end: number;
}

const FALLBACK = "FALLBACK";
const NOLAZY = "NOLAZY";
const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);
const EVENT_ATTR = /\son[a-z]+=\{/;

function readTag(markup: string, start: number, expressions: number[]): Tag {
  const closing = markup[start + 1] === "/";
  let pos = start + (closing ? 2 : 1);
  const nameStart = pos;
  while (pos < markup.length && /[\w:.-]/.test(markup[pos]!)) pos++;
  const name = markup.slice(nameStart, pos);
  while (pos < markup.length) {
    const ch = markup[pos]!;
    if (ch === "{") {
      expressions.push(pos);
      const end = skipExpression(markup, pos);
      if (end === -1) break;
      pos = end;
    } else if (ch === '"' || ch === "'") {
      const close = markup.indexOf(ch, pos + 1);
      if (close === -1) break;
      pos = close + 1;
    } else if (ch === ">") {
      return { name, start, end: pos + 1, closing, selfClosing: markup[pos - 1] === "/" };
    } else {
      pos++;
    }
  }
  return { name, start, end: markup.length, closing, selfClosing: false };
}

/** Every tag in the markup, in order. Comments are skipped, and `{...}` is skipped unless it is an expression to check. */
function readTags(markup: string, expressions: number[]): Tag[] {
  const tags: Tag[] = [];
  let pos = 0;
  while (pos < markup.length) {
    if (markup.startsWith("<!--", pos)) {
      const end = markup.indexOf("-->", pos);
      pos = end === -1 ? markup.length : end + 3;
    } else if (markup[pos] === "{") {
      expressions.push(pos);
      const end = skipExpression(markup, pos);
      pos = end === -1 ? markup.length : end;
    } else if (markup[pos] === "<" && /[A-Za-z/]/.test(markup[pos + 1] ?? "")) {
      const tag = readTag(markup, pos, expressions);
      tags.push(tag);
      pos = tag.end;
    } else {
      pos++;
    }
  }
  return tags;
}

function failAt(
  markup: string,
  file: string,
  index: number,
  code: ErrorCodeName,
  values?: Values,
): LuciaError {
  const span = { file, line: lineAt(markup, index), column: columnAt(markup, index) };
  return luciaError(code, values, span);
}

/** Index of the closing tag that ends a block opened at `open`, counting only the tags inside it. */
function closeOf(tags: Tag[], open: number, name: string): number {
  let depth = 0;
  for (let i = open + 1; i < tags.length; i++) {
    const tag = tags[i]!;
    if (tag.name === name && tag.closing && depth === 0) return i;
    depth = nextDepth(depth, tag);
  }
  return -1;
}

function nextDepth(depth: number, tag: Tag): number {
  if (tag.closing) return Math.max(0, depth - 1);
  if (tag.selfClosing || VOID_TAGS.has(tag.name.toLowerCase())) return depth;
  return depth + 1;
}

/** Removes <FALLBACK> and <NOLAZY /> from the markup and checks them. Only top-level markers are allowed. */
export function extractMarkers(markup: string, file: string): Markers {
  const expressions: number[] = [];
  const tags = readTags(markup, expressions);
  const removed: Span[] = [];
  let fallback: FallbackBlock | null = null;
  let nolazy = false;
  let depth = 0;
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i]!;
    if (tag.name === FALLBACK && !tag.closing) {
      if (depth > 0) throw failAt(markup, file, tag.start, "L1038", { tag: FALLBACK });
      if (fallback) throw failAt(markup, file, tag.start, "L1039");
      const close = closeOf(tags, i, FALLBACK);
      if (close === -1) throw failAt(markup, file, tag.start, "L1001", { tag: FALLBACK });
      const closeTag = tags[close]!;
      checkFallbackContent(
        markup,
        file,
        tags.slice(i + 1, close),
        expressions,
        tag.end,
        closeTag.start,
      );
      fallback = { content: markup.slice(tag.end, closeTag.start), line: lineAt(markup, tag.end) };
      removed.push({ start: tag.start, end: closeTag.end });
      i = close;
    } else if (tag.name === NOLAZY) {
      if (depth > 0) throw failAt(markup, file, tag.start, "L1038", { tag: NOLAZY });
      if (nolazy) throw failAt(markup, file, tag.start, "L1040");
      if (!tag.selfClosing) throw failAt(markup, file, tag.start, "L1041");
      nolazy = true;
      removed.push({ start: tag.start, end: tag.end });
    } else {
      depth = nextDepth(depth, tag);
    }
  }
  return { markup: blank(markup, removed), fallback, nolazy };
}

function checkFallbackContent(
  markup: string,
  file: string,
  inside: Tag[],
  expressions: number[],
  from: number,
  to: number,
): void {
  for (const tag of inside) {
    if (tag.name === FALLBACK) throw failAt(markup, file, tag.start, "L1038", { tag: FALLBACK });
    if (/^[A-Z]/.test(tag.name)) {
      throw failAt(markup, file, tag.start, "L1042", {
        what: `The component or tag <${tag.name}>`,
      });
    }
    if (EVENT_ATTR.test(markup.slice(tag.start, tag.end))) {
      throw failAt(markup, file, tag.start, "L1042", { what: "An event such as onclick" });
    }
  }
  const expression = expressions.find((index) => index > from && index < to);
  if (expression !== undefined) {
    throw failAt(markup, file, expression, "L1042", { what: "An expression in {braces}" });
  }
}

/** Replaces each span with its line breaks, so the lines after it keep their numbers. */
function blank(markup: string, spans: Span[]): string {
  let result = "";
  let last = 0;
  for (const span of spans) {
    result +=
      markup.slice(last, span.start) + markup.slice(span.start, span.end).replace(/[^\n]/g, "");
    last = span.end;
  }
  return result + markup.slice(last);
}
