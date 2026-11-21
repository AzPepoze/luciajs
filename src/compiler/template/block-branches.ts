import type { AttrKind } from "./check/checks.ts";
import { expectClose, readHeader } from "./block-header.ts";
import { CHAIN_TAG, type BodyReader } from "./block-tokens.ts";
import type { Cursor } from "./scan/cursor.ts";
import type { IfBinding } from "./types/if.ts";
import type { Branch } from "./types/template.ts";

const NO_ATTRS: ReadonlyMap<string, AttrKind> = new Map();

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

export function readIf(c: Cursor, body: BodyReader): IfBinding {
  const branches = [readBranch(c, "IF", body)];
  let name = readChainName(c);
  while (name) {
    branches.push(readBranch(c, name, body));
    name = name === "ELSEIF" ? readChainName(c) : undefined;
  }
  return { kind: "if", branches };
}
