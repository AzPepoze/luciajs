import { ELEMENT_MARKER, TEXT_MARKER } from "@runtime/markers.ts";
import { blockCheck, componentCheck, elementCheck } from "./checks.ts";
import { compileElement } from "./element.ts";
import { componentBindsOf, isBindName } from "./bind.ts";
import { readHtml, HTML_TAG } from "./html.ts";
import { readAttributes, type AttrCheck } from "./attributes.ts";
import { atBlockBoundary, blockOpenAt, failBoundary, readBlock } from "./blocks.ts";
import { Cursor } from "./cursor.ts";
import type { AttrBinding, Binding, ComponentBinding, Template } from "./types.ts";

export type { AttrBinding, AttrPart, Binding, Template } from "./types.ts";

const TAG_NAME_END = /[\s>/]/;
const CONTENT_TAG = "CONTENT";

/** What one component file's markup shares across all its scanners. */
interface ScanScope {
  components: ReadonlySet<string>;
  contentUsed: boolean;
}

function isBlank(template: Template): boolean {
  return template.html.trim() === "" && template.bindings.length === 0;
}

class TemplateScanner {
  private html = "";
  private readonly bindings: Binding[] = [];

  constructor(
    private readonly cursor: Cursor,
    private readonly scope: ScanScope,
    /** Inside a component's children, the close tag that ends them. */
    private readonly closeTag?: string,
  ) {}

  /** Reads markup until the input ends, a block boundary (a closing control tag or ELSE) or the close tag. */
  scanBody(): Template {
    while (this.cursor.pos < this.cursor.src.length && !this.atEnd()) this.step();
    return { html: this.html, bindings: this.bindings };
  }

  private atEnd(): boolean {
    const c = this.cursor;
    return atBlockBoundary(c) || (this.closeTag !== undefined && c.startsWith(this.closeTag));
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
    return new TemplateScanner(this.cursor, this.scope, this.closeTag).scanBody();
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
    if (name === CONTENT_TAG) return this.addContent(start);
    if (name === HTML_TAG) return this.addHtml(start);
    const isComponent = this.scope.components.has(name);
    const check: AttrCheck = isComponent ? componentCheck : elementCheck(name);
    const { attrs, selfClosing } = readAttributes(c, name, start, check);
    if (isComponent) this.addComponent(name, attrs, selfClosing, start);
    else this.addElement(name, attrs, selfClosing);
  }

  private addContent(start: number): void {
    const c = this.cursor;
    const { selfClosing } = readAttributes(c, CONTENT_TAG, start, blockCheck(CONTENT_TAG, new Map()));
    if (!selfClosing) c.fail("L1036", {}, start);
    if (this.scope.contentUsed) c.fail("L1035", {}, start);
    this.scope.contentUsed = true;
    this.bindings.push({ kind: "content" });
    this.html += `<!--${TEXT_MARKER}-->`;
  }

  private addHtml(start: number): void {
    this.bindings.push({ kind: "html", expr: readHtml(this.cursor, start) });
    this.html += `<!--${TEXT_MARKER}-->`;
  }

  private addElement(name: string, attrs: AttrBinding[], selfClosing: boolean): void {
    const { statics, binding } = compileElement(attrs);
    if (binding) this.bindings.push(binding);
    const marker = binding ? ` ${ELEMENT_MARKER}` : "";
    this.html += `<${name}${statics}${marker}${selfClosing ? " />" : ">"}`;
  }

  private addComponent(
    name: string,
    props: AttrBinding[],
    selfClosing: boolean,
    start: number,
  ): void {
    const binding: ComponentBinding = {
      kind: "component",
      name,
      props: props.filter((attr) => !isBindName(attr.name)),
      binds: componentBindsOf(props),
    };
    if (!selfClosing) {
      const children = this.readChildren(name, start);
      if (children) binding.children = children;
    }
    this.bindings.push(binding);
    this.html += `<!--${TEXT_MARKER}-->`;
  }

  /** Reads the markup between a component's open and close tags. Blank children count as none. */
  private readChildren(name: string, start: number): Template | undefined {
    const c = this.cursor;
    const close = `</${name}>`;
    const children = new TemplateScanner(c, this.scope, close).scanBody();
    if (!c.startsWith(close)) {
      if (c.pos < c.src.length) failBoundary(c);
      c.fail("L1009", { name }, start);
    }
    c.pos += close.length;
    return isBlank(children) ? undefined : children;
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
  const scope: ScanScope = { components, contentUsed: false };
  const template = new TemplateScanner(cursor, scope).scanBody();
  if (cursor.pos < markup.length) failBoundary(cursor);
  return template;
}
