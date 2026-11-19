import type { Cursor } from "./cursor.ts";
import type { AttrBinding, AttrPart } from "./types.ts";

export type Fail = (message: string) => never;

/** Checks one attribute as it is read. `previous` holds the attributes read before it. */
export type AttrCheck = (attr: AttrBinding, previous: AttrBinding[], fail: Fail) => void;

const NAME_END = /[\s=>/]/;
const UNQUOTED_END = /[\s>]/;

export function hasExpression(parts: AttrPart[]): boolean {
  return parts.some((part) => typeof part !== "string");
}

/** The expression of a value that is exactly `{expr}`, or undefined for anything else. */
export function expressionOf({ parts }: AttrBinding): string | undefined {
  const only = parts[0];
  if (parts.length !== 1 || only === undefined || typeof only === "string") return undefined;
  return only.expr;
}

/** The expression of the attribute called `name`, if it is exactly `{expr}`. */
export function attrExpression(attrs: AttrBinding[], name: string): string | undefined {
  const attr = attrs.find((other) => other.name === name);
  return attr && expressionOf(attr);
}

export function formatStaticAttr({ name, parts }: AttrBinding): string {
  if (parts.length === 0) return name;
  return `${name}="${escapeAttr(parts.join(""))}"`;
}

function escapeAttr(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

/** Reads attributes up to the end of a tag. The cursor stops on `>` or `/>`. */
export function readAttributes(
  cursor: Cursor,
  name: string,
  start: number,
  check: AttrCheck,
): { attrs: AttrBinding[]; selfClosing: boolean } {
  const attrs: AttrBinding[] = [];
  for (;;) {
    cursor.skipWhitespace();
    if (!cursor.peek()) cursor.fail(`unclosed <${name}>`, start);
    if (cursor.peek() === ">" || cursor.startsWith("/>")) break;
    const at = cursor.pos;
    const attr = readAttribute(cursor);
    check(attr, attrs, (message) => cursor.fail(message, at));
    attrs.push(attr);
  }
  const selfClosing = cursor.peek() === "/";
  cursor.pos += selfClosing ? 2 : 1;
  return { attrs, selfClosing };
}

function readAttribute(cursor: Cursor): AttrBinding {
  const name = cursor.readUntil(NAME_END);
  if (!name) cursor.fail("expected an attribute name");
  cursor.skipWhitespace();
  if (cursor.peek() !== "=") return { name, parts: [] };
  cursor.pos++;
  cursor.skipWhitespace();
  return { name, parts: readAttributeValue(cursor) };
}

function readAttributeValue(cursor: Cursor): AttrPart[] {
  const quote = cursor.peek();
  if (quote === "{") return [{ expr: cursor.readExpression() }];
  if (quote !== '"' && quote !== "'") return [cursor.readUntil(UNQUOTED_END)];
  const start = cursor.pos++;
  const parts: AttrPart[] = [];
  let literal = "";
  while (cursor.peek() !== quote) {
    if (!cursor.peek()) cursor.fail("unclosed attribute value", start);
    if (cursor.peek() === "{") {
      if (literal) parts.push(literal);
      literal = "";
      parts.push({ expr: cursor.readExpression() });
    } else {
      literal += cursor.src[cursor.pos++];
    }
  }
  cursor.pos++;
  if (literal) parts.push(literal);
  return parts;
}
