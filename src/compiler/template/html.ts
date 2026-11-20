import { readAttributes } from "./attributes.ts";
import { blockCheck } from "./checks.ts";
import type { Cursor } from "./cursor.ts";
import type { Expr } from "./types.ts";

export const HTML_TAG = "HTML";
const CLOSE_TAG = "</HTML>";

/** Reads the `{expr}` of `<HTML>{expr}</HTML>`. The cursor must be just past the tag name. */
export function readHtml(c: Cursor, start: number): Expr {
  const { selfClosing } = readAttributes(c, HTML_TAG, start, blockCheck(HTML_TAG, new Map()));
  if (selfClosing) c.fail("L1037", {}, start);
  c.skipWhitespace();
  if (c.peek() !== "{") c.fail("L1037", {}, start);
  const expr = c.readExpression();
  c.skipWhitespace();
  if (!c.startsWith(CLOSE_TAG)) c.fail("L1037", {}, start);
  c.pos += CLOSE_TAG.length;
  return expr;
}
