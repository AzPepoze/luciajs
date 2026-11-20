import { groupEnd, skipNonCode } from "./group.ts";

interface Wrap {
  /** Index of the `variable` word. */
  variableStart: number;
  /** Index just past the call's closing bracket. */
  end: number;
  name: string;
}

const DECLARATION = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?=variable\b)/y;
const OPENERS = new Set(["(", "[", "{"]);
const CLOSERS = new Set([")", "]", "}"]);
const VARIABLE_WORD = "variable".length;
const OPEN_PAREN = /\s*\(/y;

/** Index just past the type arguments that start at `pos`, or `pos` when there are none. */
function skipTypeArguments(src: string, pos: number): number {
  if (src[pos] !== "<") return pos;
  let depth = 0;
  for (let i = pos; i < src.length; i++) {
    if (src[i] === "<") depth++;
    else if (src[i] === ">" && --depth === 0) return i + 1;
  }
  return pos;
}

/** A `variable(...)` call that starts a declaration at `pos`, or null. */
function matchStoreDeclaration(src: string, pos: number): Wrap | null {
  DECLARATION.lastIndex = pos;
  const match = DECLARATION.exec(src);
  if (!match) return null;
  const variableStart = pos + match[0].length;
  OPEN_PAREN.lastIndex = skipTypeArguments(src, variableStart + VARIABLE_WORD);
  if (!OPEN_PAREN.test(src)) return null;
  const open = OPEN_PAREN.lastIndex - 1;
  const end = groupEnd(src, open);
  return end === -1 ? null : { variableStart, end, name: match[1]! };
}

/** Wraps each top-level `variable(...)` declaration as `__hotVariable("name", variable(...))`. */
export function hotVariables(script: string): string {
  const wraps: Wrap[] = [];
  let depth = 0;
  let pos = 0;
  while (pos < script.length) {
    const next = skipNonCode(script, pos);
    if (next !== pos) {
      pos = next;
      continue;
    }
    const ch = script[pos]!;
    if (OPENERS.has(ch)) depth++;
    else if (CLOSERS.has(ch)) depth--;
    else if (depth === 0) {
      const wrap = matchStoreDeclaration(script, pos);
      if (wrap) wraps.push(wrap);
    }
    pos++;
  }
  return wrapAll(script, wraps);
}

function wrapAll(script: string, wraps: Wrap[]): string {
  let out = script;
  for (const { variableStart, end, name } of [...wraps].reverse()) {
    const call = out.slice(variableStart, end);
    out = `${out.slice(0, variableStart)}__hotVariable(${JSON.stringify(name)}, ${call})${out.slice(end)}`;
  }
  return out;
}
