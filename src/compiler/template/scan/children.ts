import { failBoundary } from "../blocks.ts";
import type { Template } from "../types/template.ts";
import type { Cursor } from "./cursor.ts";
import { isBlank } from "./scope.ts";

/** Blank children count as none. */
export function readComponentChildren(
  c: Cursor,
  name: string,
  start: number,
  scanChildren: (close: string) => Template,
): Template | undefined {
  const close = `</${name}>`;
  const children = scanChildren(close);
  if (!c.startsWith(close)) {
    if (c.pos < c.src.length) failBoundary(c);
    c.fail("L1009", { name }, start);
  }
  c.pos += close.length;
  return isBlank(children) ? undefined : children;
}
