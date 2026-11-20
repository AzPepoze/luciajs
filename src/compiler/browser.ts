import { transform } from "sucrase";
import { LuciaError } from "./errors.ts";
import { compileParts } from "./pipeline.ts";
import { parse, type Section } from "./parse/sections.ts";
import { scopeCss, styleMode } from "./style/modes.ts";
import type { StyleResult } from "./style/sass.ts";

export { LuciaError } from "./errors.ts";

export interface BrowserCompile {
  /** Plain JavaScript, with the TypeScript removed. */
  code: string;
  /** True when a style is not plain CSS. Sass does not run in the browser, so those styles are used as written. */
  hasSass: boolean;
}

/** Compiles a .lucia file for the browser, without Node modules or Sass. Syntax errors in the script point at the source. */
export function compileForBrowser(source: string, file: string): BrowserCompile {
  checkScriptSyntax(source, file);
  let hasSass = false;
  const { code } = compileParts(source, file, {
    dev: true,
    displayFile: file,
    styles: (style, _index, id) => {
      if (style.attrs.lang !== "css") hasSass = true;
      return plainStyle(style, id);
    },
  });
  return { code: stripTypes(code, file), hasSass };
}

/** Removes the TypeScript from a script or module. Throws a SyntaxError with `loc` on bad syntax. */
export function stripTypes(code: string, file: string): string {
  return transform(code, { transforms: ["typescript"], filePath: file }).code;
}

// The generated code moves lines around, so the script is checked on its own, with the source's line numbers.
function checkScriptSyntax(source: string, file: string): void {
  const script = parse(source, file).script;
  if (!script) return;
  try {
    stripTypes(script.content, file);
  } catch (error) {
    const loc = (error as { loc?: { line: number; column: number } }).loc;
    if (!(error instanceof SyntaxError) || !loc) throw error;
    const line = script.line + loc.line - 1;
    throw new LuciaError(cleanSyntaxMessage(error.message), file, line, loc.column, {
      hint: "Fix the TypeScript in the script.",
    });
  }
}

/** A sucrase syntax message without its file prefix and position. */
export function cleanSyntaxMessage(message: string): string {
  return message.replace(/^Error transforming [^:]*: /, "").replace(/ \(\d+:\d+\)$/, "");
}

function plainStyle(style: Section, id: string): StyleResult {
  return { css: scopeCss(style.content, id, styleMode(style)).trim(), deps: [], sassMs: 0 };
}
