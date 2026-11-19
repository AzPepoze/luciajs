import { ELEMENT_MARKER, TEXT_MARKER } from "@runtime/markers.ts";
import { componentCheck, elementCheck } from "./checks.ts";
import { compileElement } from "./element.ts";
import { readAttributes, type AttrCheck } from "./attributes.ts";
import { atBlockBoundary, blockOpenAt, failBoundary, readBlock } from "./blocks.ts";
import { Cursor } from "./cursor.ts";
import type { AttrBinding, Binding, Template } from "./types.ts";

export type { AttrBinding, AttrPart, Binding, Template } from "./types.ts";

const TAG_NAME_END = /[\s>/]/;

class TemplateScanner {
  private html = "";
  private readonly bindings: Binding[] = [];

  constructor(
    private readonly cursor: Cursor,
    private readonly components: ReadonlySet<string>,
  ) {}

  /** Reads markup until the input ends or a block boundary (a closing control tag or ELSE). */
  scanBody(): Template {
    while (this.cursor.pos < this.cursor.src.length && !atBlockBoundary(this.cursor)) this.step();
    return { html: this.html, bindings: this.bindings };
  }

  private step(): void {
    const c = this.cursor;
    if (c.startsWith("<!--")) this.copyComment();
    else if (blockOpenAt(c)) this.addBlock();
    else if (this.isTagStart()) this.readTag();
    else if (c.peek() === "{") this.readTextExpression();
    else this.html += c.src[c.pos++];
  }

  private isTagStart(): boolean {
    return this.cursor.peek() === "<" && /[a-zA-Z/]/.test(this.cursor.peek(1));
  }

  private copyComment(): void {
    const c = this.cursor;
    const end = c.src.indexOf("-->", c.pos);
    if (end === -1) c.fail("L1006");
    this.html += c.src.slice(c.pos, end + 3);
    c.pos = end + 3;
  }

  private readTextExpression(): void {
    this.bindings.push({ kind: "text", expr: this.cursor.readExpression() });
    this.html += `<!--${TEXT_MARKER}-->`;
  }

  private addBlock(): void {
    const name = blockOpenAt(this.cursor)!;
    this.bindings.push(readBlock(this.cursor, name, () => this.scanNested()));
    this.html += `<!--${TEXT_MARKER}-->`;
  }

  private scanNested(): Template {
    return new TemplateScanner(this.cursor, this.components).scanBody();
  }

  private readTag(): void {
    const c = this.cursor;
    const start = c.pos;
    c.pos++;
    if (c.peek() === "/") {
      const end = c.src.indexOf(">", c.pos);
      if (end === -1) c.fail("L1008", {}, start);
      this.html += c.src.slice(start, end + 1);
      c.pos = end + 1;
      return;
    }
    const name = c.readUntil(TAG_NAME_END);
    const isComponent = this.components.has(name);
    const check: AttrCheck = isComponent ? componentCheck : elementCheck(name);
    const { attrs, selfClosing } = readAttributes(c, name, start, check);
    if (isComponent) this.addComponent(name, attrs, selfClosing, start);
    else this.addElement(name, attrs, selfClosing);
  }

  private addElement(name: string, attrs: AttrBinding[], selfClosing: boolean): void {
    const { statics, binding } = compileElement(attrs);
    if (binding) this.bindings.push(binding);
    const marker = binding ? ` ${ELEMENT_MARKER}` : "";
    this.html += `<${name}${statics}${marker}${selfClosing ? " />" : ">"}`;
  }

  private addComponent(name: string, props: AttrBinding[], selfClosing: boolean, start: number): void {
    if (!selfClosing) this.skipComponentClose(name, start);
    this.bindings.push({ kind: "component", name, props });
    this.html += `<!--${TEXT_MARKER}-->`;
  }

  private skipComponentClose(name: string, start: number): void {
    const c = this.cursor;
    c.skipWhitespace();
    const close = `</${name}>`;
    if (!c.startsWith(close)) c.fail("L1009", { name }, start);
    c.pos += close.length;
  }
}

/** Turn markup with `{expr}` and control tags into static HTML plus the bindings to wire at attach. */
export function compileTemplate(
  markup: string,
  file: string,
  startLine = 1,
  components: ReadonlySet<string> = new Set(),
): Template {
  const cursor = new Cursor(markup, file, startLine);
  const template = new TemplateScanner(cursor, components).scanBody();
  if (cursor.pos < markup.length) failBoundary(cursor);
  return template;
}
