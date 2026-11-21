import { CLOSE_TAG } from "./block-tokens.ts";
import { blockCheck, type AttrKind } from "./check/checks.ts";
import type { Cursor } from "./scan/cursor.ts";
import type { AttrBinding } from "./types/attribute.ts";
import type { Expr } from "./types/expression.ts";
import { readAttributes } from "./scan/attributes.ts";

interface Header {
  expr?: Expr;
  attrs: AttrBinding[];
}

/** The cursor must be on `<`. Reads the tag's `{expr}` (when allowed) and its attributes. */
export function readHeader(
  c: Cursor,
  name: string,
  kinds: ReadonlyMap<string, AttrKind>,
  takesExpr: boolean,
): Header {
  const start = c.pos;
  c.pos += name.length + 1;
  c.skipWhitespace();
  const expr = takesExpr && c.peek() === "{" ? c.readExpression() : undefined;
  const { attrs, selfClosing } = readAttributes(c, name, start, blockCheck(name, kinds));
  if (selfClosing) c.fail("L1026", { name }, start);
  return { expr, attrs };
}

export function expectClose(c: Cursor, name: string, start: number): void {
  const match = c.match(CLOSE_TAG);
  if (!match) {
    if (c.pos >= c.src.length) c.fail("L1001", { tag: name }, start);
    c.fail("L1027", { name });
  }
  if (match[1] !== name) c.fail("L1028", { name, found: match[1]! });
  c.pos += match[0].length;
}
