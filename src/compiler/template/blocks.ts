import { attrExpression, readAttributes } from "./attributes.ts";
import { blockCheck, type AttrKind } from "./checks.ts";
import type { Cursor } from "./cursor.ts";
import type { AttrBinding, Binding, Branch, EachBinding, Expr, ForBinding, IfBinding, Template } from "./types.ts";

export type BlockName = "IF" | "EACH" | "FOR";
export type BodyReader = () => Template;

const OPEN_TAG = /<(IF|EACH|FOR)(?=[\s/>])/y;
const CLOSE_TAG = /<\/(IF|ELSEIF|ELSE|EACH|FOR)\s*>/y;
const CHAIN_TAG = /<(ELSEIF|ELSE)(?=[\s/>])/y;
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

const NO_ATTRS: ReadonlyMap<string, AttrKind> = new Map();
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

interface Header {
  expr?: Expr;
  attrs: AttrBinding[];
}

/** The cursor must be on `<`. Reads the tag's `{expr}` (when allowed) and its attributes. */
function readHeader(c: Cursor, name: string, kinds: ReadonlyMap<string, AttrKind>, takesExpr: boolean): Header {
  const start = c.pos;
  c.pos += name.length + 1;
  c.skipWhitespace();
  const expr = takesExpr && c.peek() === "{" ? c.readExpression() : undefined;
  const { attrs, selfClosing } = readAttributes(c, name, start, blockCheck(name, kinds));
  if (selfClosing) c.fail("L1026", { name }, start);
  return { expr, attrs };
}

function expectClose(c: Cursor, name: string, start: number): void {
  const match = c.match(CLOSE_TAG);
  if (!match) {
    if (c.pos >= c.src.length) c.fail("L1001", { tag: name }, start);
    c.fail("L1027", { name });
  }
  if (match[1] !== name) c.fail("L1028", { name, found: match[1]! });
  c.pos += match[0].length;
}

function readBranch(c: Cursor, name: "IF" | "ELSEIF" | "ELSE", body: BodyReader): Branch {
  const start = c.pos;
  const isElse = name === "ELSE";
  const header = readHeader(c, name, NO_ATTRS, !isElse);
  if (!isElse && header.expr === undefined) c.fail("L1029", { name }, start);
  const template = body();
  expectClose(c, name, start);
  return isElse ? { body: template } : { test: header.expr, body: template };
}

/** Looks past whitespace for `<ELSEIF` or `<ELSE`. Moves the cursor onto it, or leaves it where it was. */
function readChainName(c: Cursor): "ELSEIF" | "ELSE" | undefined {
  const saved = c.pos;
  c.skipWhitespace();
  const match = c.match(CHAIN_TAG);
  if (!match) {
    c.pos = saved;
    return undefined;
  }
  return match[1] as "ELSEIF" | "ELSE";
}

function readIf(c: Cursor, body: BodyReader): IfBinding {
  const branches = [readBranch(c, "IF", body)];
  let name = readChainName(c);
  while (name) {
    branches.push(readBranch(c, name, body));
    name = name === "ELSEIF" ? readChainName(c) : undefined;
  }
  return { kind: "if", branches };
}

function readEach(c: Cursor, body: BodyReader): EachBinding {
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

function readFor(c: Cursor, body: BodyReader): ForBinding {
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

/** The cursor must be on `<`. Reads a whole block, including its ELSEIF and ELSE chain. */
export function readBlock(c: Cursor, name: BlockName, body: BodyReader): Binding {
  if (name === "IF") return readIf(c, body);
  if (name === "EACH") return readEach(c, body);
  return readFor(c, body);
}

/** The block that opens at the cursor, if any. */
export function blockOpenAt(c: Cursor): BlockName | undefined {
  return c.match(OPEN_TAG)?.[1] as BlockName | undefined;
}

/** A closing control tag or a chain tag. A body stops here and leaves it to its block. */
export function atBlockBoundary(c: Cursor): boolean {
  return c.match(CLOSE_TAG) !== null || c.match(CHAIN_TAG) !== null;
}

/** Reports a closing or chain tag that no block claimed. The cursor must be on it. */
export function failBoundary(c: Cursor): never {
  const close = c.match(CLOSE_TAG);
  if (close) c.fail("L1033", { tag: close[1]! });
  const chain = c.match(CHAIN_TAG);
  c.fail("L1034", { tag: chain?.[1] ?? "ELSE" });
}
