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
}

export class LuciaError extends Error {
  constructor(message: string, readonly file: string, readonly line: number, readonly column: number) {
    super(`${file}:${line}:${column}: ${message}`);
  }
}

const SECTION = /<(script|style)(\s[^>]*)?>([\s\S]*?)<\/\1>/g;
const ATTR = /([\w-]+)(?:="([^"]*)")?/g;

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

function parseAttrs(raw: string | undefined): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const [, name, value] of (raw ?? "").matchAll(ATTR)) attrs[name!] = value ?? "";
  return attrs;
}

export function parse(source: string, file: string): ParsedFile {
  const result: ParsedFile = { script: null, style: null, markup: "" };
  let markup = "";
  let last = 0;
  for (const match of source.matchAll(SECTION)) {
    const [whole, tag, rawAttrs, content] = match;
    const index = match.index!;
    const kind = tag as "script" | "style";
    if (result[kind]) {
      throw new LuciaError(`only one <${kind}> is allowed`, file, lineAt(source, index), 1);
    }
    const contentStart = index + whole.indexOf(">") + 1;
    result[kind] = { content: content!, attrs: parseAttrs(rawAttrs), line: lineAt(source, contentStart) };
    markup += source.slice(last, index);
    last = index + whole.length;
  }
  markup += source.slice(last);
  result.markup = markup.trim();
  return result;
}
