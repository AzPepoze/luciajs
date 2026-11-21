import { skipExpression } from "../utils/braces.ts";

export interface Tag {
  name: string;
  start: number;
  end: number;
  closing: boolean;
  selfClosing: boolean;
}

export const VOID_TAGS = new Set([
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

/** Every tag in order. Skips comments and `{...}`, and records each `{` in `expressions`. */
export function readTags(markup: string, expressions: number[]): Tag[] {
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

/** The depth after `tag`, where depth counts the open elements. Void and self-closing tags do not open one. */
export function nextDepth(depth: number, tag: Tag): number {
  if (tag.closing) return Math.max(0, depth - 1);
  if (tag.selfClosing || VOID_TAGS.has(tag.name.toLowerCase())) return depth;
  return depth + 1;
}
