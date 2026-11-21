import { expressionEnd } from "./format-expressions.ts";
import { closingQuote } from "./object-literal.ts";

const PAIRED_OPEN = /^<(IF|ELSEIF|ELSE|EACH|FOR|HTML|FALLBACK)(?=[\s/>])/;
const PAIRED_CLOSE = /^<\/(IF|ELSEIF|ELSE|EACH|FOR|HTML|FALLBACK)\s*>/;
const MARKER = /^<div\s+data-lusia-flow="(\d+)"\s*>$/;
const DIV_CLOSE = /^<\/div\s*>$/;

export interface FlowTag {
  open: string;
  type: string;
}

export interface ProtectedFlow {
  text: string;
  tags: FlowTag[];
}

/** Keeps each opening tag whole, for restoreFlowTags. */
export function protectFlowTags(markup: string): ProtectedFlow {
  const tags: FlowTag[] = [];
  let text = "";
  let index = 0;
  let paragraphs = 0;
  while (index < markup.length) {
    const ch = markup.charAt(index);
    if (ch === "{") {
      const end = expressionEnd(markup, index);
      const next = end === -1 ? index + 1 : end + 1;
      text += markup.slice(index, next);
      index = next;
      continue;
    }
    if (ch !== "<") {
      text += ch;
      index++;
      continue;
    }
    if (markup.startsWith("<!--", index)) {
      const end = markup.indexOf("-->", index);
      const next = end === -1 ? markup.length : end + 3;
      text += markup.slice(index, next);
      index = next;
      continue;
    }
    const close = PAIRED_CLOSE.exec(markup.slice(index));
    if (close && paragraphs === 0) {
      text += "</div>";
      index += close[0].length;
      continue;
    }
    const open = PAIRED_OPEN.exec(markup.slice(index));
    if (open && paragraphs === 0) {
      const end = tagEnd(markup, index);
      if (end !== -1) {
        text += `<div data-lusia-flow="${tags.length}">`;
        tags.push({ open: markup.slice(index, end + 1), type: open[1] ?? "" });
        index = end + 1;
        continue;
      }
    }
    const end = tagEnd(markup, index);
    const next = end === -1 ? index + 1 : end + 1;
    const tag = markup.slice(index, next);
    paragraphs = paragraphDepth(tag, paragraphs);
    text += tag;
    index = next;
  }
  return { text, tags };
}

/** A block placeholder would close an open `<p>`, so flow tags inside one stay as they are. */
function paragraphDepth(tag: string, depth: number): number {
  if (/^<p(?=[\s>])/i.test(tag)) return depth + 1;
  if (/^<\/p\s*>/i.test(tag)) return Math.max(0, depth - 1);
  return depth;
}

export function restoreFlowTags(html: string, tags: FlowTag[]): string {
  const stack: Array<number | undefined> = [];
  let text = "";
  let index = 0;
  while (index < html.length) {
    if (html.charAt(index) !== "<") {
      text += html.charAt(index);
      index++;
      continue;
    }
    if (html.startsWith("<!--", index)) {
      const end = html.indexOf("-->", index);
      const next = end === -1 ? html.length : end + 3;
      text += html.slice(index, next);
      index = next;
      continue;
    }
    const end = tagEnd(html, index);
    if (end === -1) {
      text += html.charAt(index);
      index++;
      continue;
    }
    const tag = html.slice(index, end + 1);
    const marker = MARKER.exec(tag);
    if (marker) {
      stack.push(Number(marker[1]));
      text += tagOf(tags, Number(marker[1]));
    } else if (DIV_CLOSE.test(tag)) {
      const placeholder = stack.pop();
      text += placeholder === undefined ? tag : `</${typeOf(tags, placeholder)}>`;
    } else {
      if (/^<div(?=[\s>])/i.test(tag)) stack.push(undefined);
      text += tag;
    }
    index = end + 1;
  }
  return text;
}

function tagOf(tags: FlowTag[], index: number): string {
  return tags[index]?.open ?? "";
}

function typeOf(tags: FlowTag[], index: number): string {
  return tags[index]?.type ?? "div";
}

// Quotes and {...} values may hold a `>`, so they are skipped.
function tagEnd(text: string, start: number): number {
  let index = start + 1;
  while (index < text.length) {
    const ch = text.charAt(index);
    if (ch === '"' || ch === "'") {
      index = closingQuote(text, index);
    } else if (ch === "{") {
      const end = expressionEnd(text, index);
      if (end === -1) return -1;
      index = end;
    } else if (ch === ">") {
      return index;
    }
    index++;
  }
  return -1;
}
