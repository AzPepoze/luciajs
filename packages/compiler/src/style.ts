import * as sass from "sass";
import { dirname } from "node:path";
import { LuciaError, type Section } from "./parse.ts";

const GLOBAL = /:global\(([^)]*)\)/g;
const PSEUDO_ELEMENT = /::?(before|after|placeholder|selection|marker|first-line|first-letter|backdrop)\b.*$/;
const UNSCOPED_AT_RULES = /^@(keyframes|-webkit-keyframes|font-face|page)\b/;

export function hash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(36);
}

// `.a :global(.x)` → `.a[scope] .x`: scope the part before :global, leave the rest global.
function scopeWithGlobal(selector: string, scope: string): string {
  const globalStart = selector.indexOf(":global(");
  const scopedPart = selector.slice(0, globalStart).trim();
  const globalPart = selector.slice(globalStart).replace(GLOBAL, "$1");
  if (!scopedPart) return globalPart;
  return `${scopeCompound(scopedPart, scope)} ${globalPart}`;
}

function scopeCompound(selector: string, scope: string): string {
  if (selector.includes(":global(")) return scopeWithGlobal(selector, scope);
  const pseudo = selector.match(PSEUDO_ELEMENT)?.[0] ?? "";
  const base = selector.slice(0, selector.length - pseudo.length);
  return `${base}[${scope}]${pseudo}`;
}

function scopeSelectorList(list: string, scope: string): string {
  return list
    .split(",")
    .map((s) => scopeCompound(s.trim(), scope))
    .join(", ");
}

function findBlockEnd(css: string, open: number): number {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return i;
  }
  return css.length - 1;
}

export function scopeCss(css: string, scope: string): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open === -1) return out + css.slice(i);
    const prelude = css.slice(i, open).trim();
    const close = findBlockEnd(css, open);
    const body = css.slice(open + 1, close);
    if (UNSCOPED_AT_RULES.test(prelude)) out += `${prelude} {${body}}\n`;
    else if (prelude.startsWith("@")) out += `${prelude} {\n${scopeCss(body, scope)}}\n`;
    else out += `${scopeSelectorList(prelude, scope)} {${body}}\n`;
    i = close + 1;
  }
  return out;
}

export function compileStyle(style: Section, file: string, scope: string): string {
  const isPlainCss = style.attrs.lang === "css";
  const css = isPlainCss ? style.content : compileScss(style, file);
  return scopeCss(css, scope).trim();
}

function compileScss(style: Section, file: string): string {
  try {
    return sass.compileString(style.content, { loadPaths: [dirname(file)], style: "expanded" }).css;
  } catch (error) {
    const span = (error as sass.Exception).span;
    const line = span ? style.line + span.start.line : style.line;
    const column = span ? span.start.column + 1 : 1;
    throw new LuciaError((error as sass.Exception).sassMessage ?? String(error), file, line, column);
  }
}
