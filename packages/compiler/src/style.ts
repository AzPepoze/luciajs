import * as sass from "sass";
import { dirname } from "node:path";
import { COMPONENT_ATTR } from "lucia/markers";
import { LuciaError, type Section } from "./parse.ts";

/** `tree`: this component and everything inside it. `scoped`: only its own markup. `global`: the whole page. */
export type StyleMode = "tree" | "scoped" | "global";

const UNSCOPED_AT_RULES = /^@(-webkit-)?(keyframes|font-face|page|property|counter-style)\b/;
const MODE_BLOCK = /^@(scoped|global)\s*$/;
const LEGACY_PSEUDO_ELEMENT = /^:(before|after|first-line|first-letter)\b/;
const COMBINATORS = new Set([" ", ">", "+", "~"]);
const GLOBAL = ":global(";

export function hash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) h = Math.imul(h ^ input.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(36);
}

export function styleMode(style: Section): StyleMode {
  if ("global" in style.attrs) return "global";
  if ("scoped" in style.attrs) return "scoped";
  return "tree";
}

function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === separator && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((part) => part.trim()).filter(Boolean);
}

// The scope goes on the subject compound, before any pseudo-element, which must stay last.
function subjectInsertPoint(selector: string): number {
  let depth = 0;
  let point = selector.length;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i]!;
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (depth > 0) continue;
    else if (COMBINATORS.has(ch)) point = selector.length;
    else if (ch === ":" && point === selector.length) {
      const isPseudoElement = selector[i + 1] === ":" || LEGACY_PSEUDO_ELEMENT.test(selector.slice(i));
      if (isPseudoElement) point = i;
    }
  }
  return point;
}

function scopeFilter(id: string, mode: Exclude<StyleMode, "global">): string {
  const root = `[${COMPONENT_ATTR}="${id}"]`;
  const inTree = `:where(${root}, ${root} *)`;
  if (mode === "tree") return inTree;
  const childRoot = `${root} [${COMPONENT_ATTR}]:not(${root})`;
  return `${inTree}:not(:where(${childRoot}, ${childRoot} *))`;
}

function scopeSelector(selector: string, filter: string): string {
  const point = subjectInsertPoint(selector);
  return `${selector.slice(0, point)}${filter}${selector.slice(point)}`;
}

function closingParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")" && --depth === 0) return i;
  }
  return text.length;
}

function unwrapGlobals(selector: string): string {
  let out = selector;
  for (let start = out.indexOf(GLOBAL); start !== -1; start = out.indexOf(GLOBAL)) {
    const open = start + GLOBAL.length - 1;
    const close = closingParen(out, open);
    out = out.slice(0, start) + out.slice(open + 1, close) + out.slice(close + 1);
  }
  return out;
}

// `.card :global(a)` scopes `.card` and leaves `a` global, so the filter goes on the part before :global.
function scopeWithGlobal(selector: string, filter: string): string {
  const scopedPart = selector.slice(0, selector.indexOf(GLOBAL)).trim();
  const globalPart = unwrapGlobals(selector.slice(scopedPart.length).trim());
  if (!scopedPart) return globalPart;
  return `${scopeSelector(scopedPart, filter)} ${globalPart}`;
}

function subjectStart(selector: string): number {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i]!;
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (depth === 0 && COMBINATORS.has(ch)) start = i + 1;
  }
  return start;
}

// Only what sits inside :global() is global; an unwrapped subject is still scoped.
function scopeOne(selector: string, filter: string): string {
  if (!selector.includes(GLOBAL)) return scopeSelector(selector, filter);
  const subjectIsGlobal = selector.slice(subjectStart(selector)).includes(GLOBAL);
  if (subjectIsGlobal) return scopeWithGlobal(selector, filter);
  return scopeSelector(unwrapGlobals(selector), filter);
}

function scopeSelectorList(list: string, filter: string): string {
  return splitTopLevel(list, ",")
    .map((selector) => scopeOne(selector, filter))
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

function scopeRule(prelude: string, body: string, id: string, mode: StyleMode): string {
  const modeBlock = prelude.match(MODE_BLOCK);
  if (modeBlock) return scopeCss(body, id, modeBlock[1] as StyleMode);
  if (mode === "global" || UNSCOPED_AT_RULES.test(prelude)) return `${prelude} {${body}}\n`;
  if (prelude.startsWith("@")) return `${prelude} {\n${scopeCss(body, id, mode)}}\n`;
  return `${scopeSelectorList(prelude, scopeFilter(id, mode))} {${body}}\n`;
}

/** Rewrite every selector in plain CSS for `mode`. `@scoped { }` and `@global { }` blocks switch mode. */
export function scopeCss(css: string, id: string, mode: StyleMode): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf("{", i);
    if (open === -1) return out + css.slice(i);
    const close = findBlockEnd(css, open);
    out += scopeRule(css.slice(i, open).trim(), css.slice(open + 1, close), id, mode);
    i = close + 1;
  }
  return out;
}

export function compileStyle(style: Section, file: string, id: string): string {
  const isPlainCss = style.attrs.lang === "css";
  const css = isPlainCss ? style.content : compileScss(style, file);
  return scopeCss(css, id, styleMode(style)).trim();
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
