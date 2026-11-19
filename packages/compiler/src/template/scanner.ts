import { ELEMENT_MARKER, TEXT_MARKER } from "lucia/markers";
import { LuciaError } from "../errors.ts";
import { skipExpression } from "../utils/braces.ts";
import { columnAt, lineAt } from "../utils/position.ts";

export type AttrPart = string | { expr: string };

export interface AttrBinding {
  name: string;
  parts: AttrPart[];
}

export type Binding = { kind: "text"; expr: string } | { kind: "element"; attrs: AttrBinding[] };

export interface Template {
  html: string;
  /** In document order, matching the markers in `html`. */
  bindings: Binding[];
}

const NAME_END = /[\s=>/]/;
const TAG_NAME_END = /[\s>/]/;
const WHITESPACE = /\s/;

function escapeAttr(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function hasExpression(parts: AttrPart[]): boolean {
  return parts.some((part) => typeof part !== "string");
}

class TemplateCompiler {
  private pos = 0;
  private html = "";
  private readonly bindings: Binding[] = [];

  constructor(
    private readonly src: string,
    private readonly file: string,
    private readonly startLine: number,
  ) {}

  compile(): Template {
    while (this.pos < this.src.length) this.step();
    return { html: this.html, bindings: this.bindings };
  }

  private step(): void {
    if (this.src.startsWith("<!--", this.pos)) this.copyComment();
    else if (this.isTagStart()) this.readTag();
    else if (this.peek() === "{") this.readTextExpression();
    else this.html += this.src[this.pos++];
  }

  private peek(offset = 0): string {
    return this.src[this.pos + offset] ?? "";
  }

  private isTagStart(): boolean {
    return this.peek() === "<" && /[a-zA-Z/]/.test(this.peek(1));
  }

  private copyComment(): void {
    const end = this.src.indexOf("-->", this.pos);
    if (end === -1) this.fail("unclosed comment");
    this.html += this.src.slice(this.pos, end + 3);
    this.pos = end + 3;
  }

  private readTextExpression(): void {
    this.bindings.push({ kind: "text", expr: this.readExpression() });
    this.html += `<!--${TEXT_MARKER}-->`;
  }

  private readTag(): void {
    const start = this.pos;
    this.pos++;
    if (this.peek() === "/") {
      const end = this.src.indexOf(">", this.pos);
      if (end === -1) this.fail("unclosed tag", start);
      this.html += this.src.slice(start, end + 1);
      this.pos = end + 1;
      return;
    }
    const name = this.readUntil(TAG_NAME_END);
    let staticAttrs = "";
    const dynamicAttrs: AttrBinding[] = [];
    for (;;) {
      this.skipWhitespace();
      const ch = this.peek();
      if (!ch) this.fail(`unclosed <${name}>`, start);
      if (ch === ">" || this.src.startsWith("/>", this.pos)) break;
      const attr = this.readAttribute();
      if (hasExpression(attr.parts)) dynamicAttrs.push(attr);
      else staticAttrs += ` ${this.formatStaticAttr(attr)}`;
    }
    const selfClosing = this.peek() === "/";
    this.pos += selfClosing ? 2 : 1;
    if (dynamicAttrs.length > 0) {
      this.bindings.push({ kind: "element", attrs: dynamicAttrs });
      staticAttrs += ` ${ELEMENT_MARKER}`;
    }
    this.html += `<${name}${staticAttrs}${selfClosing ? " />" : ">"}`;
  }

  private formatStaticAttr({ name, parts }: AttrBinding): string {
    if (parts.length === 0) return name;
    return `${name}="${escapeAttr(parts.join(""))}"`;
  }

  private readAttribute(): AttrBinding {
    const name = this.readUntil(NAME_END);
    if (!name) this.fail("expected an attribute name");
    this.skipWhitespace();
    if (this.peek() !== "=") return { name, parts: [] };
    this.pos++;
    this.skipWhitespace();
    return { name, parts: this.readAttributeValue() };
  }

  private readAttributeValue(): AttrPart[] {
    const quote = this.peek();
    if (quote === "{") return [{ expr: this.readExpression() }];
    if (quote !== '"' && quote !== "'") return [this.readUntil(/[\s>]/)];
    const start = this.pos++;
    const parts: AttrPart[] = [];
    let literal = "";
    while (this.peek() !== quote) {
      if (!this.peek()) this.fail("unclosed attribute value", start);
      if (this.peek() === "{") {
        if (literal) parts.push(literal);
        literal = "";
        parts.push({ expr: this.readExpression() });
      } else {
        literal += this.src[this.pos++];
      }
    }
    this.pos++;
    if (literal) parts.push(literal);
    return parts;
  }

  private readExpression(): string {
    const start = this.pos;
    const end = skipExpression(this.src, start);
    if (end === -1) this.fail("unclosed {", start);
    this.pos = end;
    const expr = this.src.slice(start + 1, end - 1).trim();
    if (!expr) this.fail("empty {}", start);
    return expr;
  }

  private readUntil(end: RegExp): string {
    const start = this.pos;
    while (this.peek() && !end.test(this.peek())) this.pos++;
    return this.src.slice(start, this.pos);
  }

  private skipWhitespace(): void {
    while (WHITESPACE.test(this.peek())) this.pos++;
  }

  private fail(message: string, at = this.pos): never {
    const line = this.startLine - 1 + lineAt(this.src, at);
    throw new LuciaError(message, this.file, line, columnAt(this.src, at));
  }
}

/** Turn markup with `{expr}` into static HTML plus the bindings to wire at attach. */
export function compileTemplate(markup: string, file: string, startLine = 1): Template {
  return new TemplateCompiler(markup, file, startLine).compile();
}
