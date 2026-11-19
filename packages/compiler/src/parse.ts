import { skipExpression } from "./scan.ts";

export interface Section {
  content: string;
  attrs: Record<string, string>;
  /** 1-based line where the content starts. */
  line: number;
}

export interface ParsedFile {
  script: Section | null;
  style: Section | null;
  markup: string;
  markupLine: number;
}

export class LuciaError extends Error {
  constructor(message: string, readonly file: string, readonly line: number, readonly column: number) {
    super(`${file}:${line}:${column}: ${message}`);
  }
}

interface SectionMatch {
  kind: "script" | "style";
  rawAttrs: string | undefined;
  start: number;
  contentStart: number;
  contentEnd: number;
  end: number;
}

const SECTION_OPEN = /<(script|style)(\s[^>]*)?>/y;
const ATTR = /([\w-]+)(?:="([^"]*)")?/g;

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

// Removed sections leave their newlines behind so markup line numbers match the source.
function keepLineBreaks(text: string): string {
  return text.replace(/[^\n]/g, "");
}

function parseAttrs(raw: string | undefined): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const [, name, value] of (raw ?? "").matchAll(ATTR)) attrs[name!] = value ?? "";
  return attrs;
}

function readSection(source: string, start: number, file: string): SectionMatch | null {
  SECTION_OPEN.lastIndex = start;
  const open = SECTION_OPEN.exec(source);
  if (!open) return null;
  const kind = open[1] as SectionMatch["kind"];
  const contentStart = start + open[0].length;
  const closeTag = `</${kind}>`;
  const contentEnd = source.indexOf(closeTag, contentStart);
  if (contentEnd === -1) throw new LuciaError(`unclosed <${kind}>`, file, lineAt(source, start), 1);
  return { kind, rawAttrs: open[2], start, contentStart, contentEnd, end: contentEnd + closeTag.length };
}

// Sections are found only in markup text: `{...}` expressions and HTML comments are skipped.
function findSections(source: string, file: string): SectionMatch[] {
  const sections: SectionMatch[] = [];
  let pos = 0;
  while (pos < source.length) {
    if (source[pos] === "{") {
      const end = skipExpression(source, pos);
      if (end === -1) break;
      pos = end;
    } else if (source.startsWith("<!--", pos)) {
      const end = source.indexOf("-->", pos);
      pos = end === -1 ? source.length : end + 3;
    } else {
      const section = source[pos] === "<" ? readSection(source, pos, file) : null;
      if (section) sections.push(section);
      pos = section ? section.end : pos + 1;
    }
  }
  return sections;
}

export function parse(source: string, file: string): ParsedFile {
  const result: ParsedFile = { script: null, style: null, markup: "", markupLine: 1 };
  let markup = "";
  let last = 0;
  for (const section of findSections(source, file)) {
    const { kind, start, end } = section;
    if (result[kind]) {
      throw new LuciaError(`only one <${kind}> is allowed`, file, lineAt(source, start), 1);
    }
    result[kind] = {
      content: source.slice(section.contentStart, section.contentEnd),
      attrs: parseAttrs(section.rawAttrs),
      line: lineAt(source, section.contentStart),
    };
    markup += source.slice(last, start) + keepLineBreaks(source.slice(start, end));
    last = end;
  }
  markup += source.slice(last);
  result.markup = markup.trim();
  result.markupLine = lineAt(markup, markup.length - markup.trimStart().length);
  return result;
}
