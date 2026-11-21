import { groupEnd, skipNonCode } from "@compiler/hot/group.ts";

const IDENTIFIER = /[A-Za-z_$][\w$]*/y;
const WORD_CHAR = /[\w$]/;
const SPACE = /\s/;
const SETUP = "setup";

/** The first argument of a top-level `setup(...)` call in a script body, or undefined. */
export function setupHook(body: string): string | undefined {
  let depth = 0;
  let pos = 0;
  // The last code character, so a comment's dot never reads as a member access.
  let before = -1;
  while (pos < body.length) {
    const next = skipNonCode(body, pos);
    if (next !== pos) {
      pos = next;
      continue;
    }
    const ch = body.charAt(pos);
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") depth = Math.max(0, depth - 1);
    else if (depth === 0 && isSetupCall(body, pos, before)) {
      const open = skipSpace(body, pos + SETUP.length);
      const close = groupEnd(body, open);
      if (close !== -1) {
        const from = skipSpace(body, open + 1);
        const expression = body.slice(from, firstArgEnd(body, from, close - 1)).trim();
        if (expression) return expression;
      }
    }
    if (!SPACE.test(ch)) before = pos;
    pos++;
  }
  return undefined;
}

/** Whether the identifier at `at` calls `setup`, rather than declaring or accessing it. */
function isSetupCall(body: string, at: number, before: number): boolean {
  if (at > 0 && WORD_CHAR.test(body.charAt(at - 1))) return false;
  IDENTIFIER.lastIndex = at;
  const match = IDENTIFIER.exec(body);
  if (!match || match[0] !== SETUP) return false;
  if (body.charAt(before) === ".") return false;
  const word = previousWord(body, before);
  if (word === "function" || word === "new") return false;
  return body.charAt(skipSpace(body, at + SETUP.length)) === "(";
}

function previousWord(body: string, end: number): string {
  let start = end;
  while (start >= 0 && WORD_CHAR.test(body.charAt(start))) start--;
  return body.slice(start + 1, end + 1);
}

function skipSpace(body: string, from: number): number {
  let pos = from;
  while (pos < body.length && SPACE.test(body.charAt(pos))) pos++;
  return pos;
}

/** Index of the comma that ends the first argument inside the call, or `close`. */
function firstArgEnd(body: string, from: number, close: number): number {
  let depth = 0;
  for (let pos = from; pos < close;) {
    const next = skipNonCode(body, pos);
    if (next !== pos) {
      pos = next;
      continue;
    }
    const ch = body.charAt(pos);
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") depth--;
    else if (ch === "," && depth === 0) return pos;
    pos++;
  }
  return close;
}
