import type { AttrKind } from "./check/checks.ts";
import { expectClose, readHeader } from "./block-header.ts";
import type { BodyReader } from "./block-tokens.ts";
import { attrExpression } from "./scan/attributes.ts";
import type { Cursor } from "./scan/cursor.ts";
import type { EachBinding } from "./types/each.ts";
import type { ForBinding } from "./types/for.ts";

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

const EACH_ATTRS: ReadonlyMap<string, AttrKind> = new Map([
  ["as", "identifier"],
  ["index", "identifier"],
  ["key", "expression"],
]);
const FOR_ATTRS: ReadonlyMap<string, AttrKind> = new Map([
  ["from", "expression"],
  ["to", "expression"],
  ["step", "expression"],
]);

export function readEach(c: Cursor, body: BodyReader): EachBinding {
  const start = c.pos;
  const { expr, attrs } = readHeader(c, "EACH", EACH_ATTRS, true);
  if (expr === undefined) c.fail("L1030", {}, start);
  const template = body();
  expectClose(c, "EACH", start);
  return {
    kind: "each",
    list: expr,
    item: attrExpression(attrs, "as")?.code,
    index: attrExpression(attrs, "index")?.code,
    key: attrExpression(attrs, "key"),
    body: template,
  };
}

export function readFor(c: Cursor, body: BodyReader): ForBinding {
  const start = c.pos;
  const { expr, attrs } = readHeader(c, "FOR", FOR_ATTRS, true);
  if (expr === undefined || !IDENTIFIER.test(expr.code)) c.fail("L1031", {}, start);
  const to = attrExpression(attrs, "to");
  if (to === undefined) c.fail("L1032", {}, start);
  const template = body();
  expectClose(c, "FOR", start);
  return {
    kind: "for",
    name: expr.code,
    from: attrExpression(attrs, "from"),
    to,
    step: attrExpression(attrs, "step"),
    body: template,
  };
}
