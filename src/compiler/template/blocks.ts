import { readIf } from "./block-branches.ts";
import { CHAIN_TAG, CLOSE_TAG, OPEN_TAG, type BlockName, type BodyReader } from "./block-tokens.ts";
import { readEach, readFor } from "./block-loops.ts";
import type { Cursor } from "./scan/cursor.ts";
import type { Binding } from "./types/template.ts";

/** The cursor must be on `<`. Reads a whole block, including its ELSEIF and ELSE chain. */
export function readBlock(c: Cursor, name: BlockName, body: BodyReader): Binding {
  if (name === "IF") return readIf(c, body);
  if (name === "EACH") return readEach(c, body);
  return readFor(c, body);
}

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
