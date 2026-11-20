import { relative } from "node:path";
import { hash } from "./id.ts";
import { splitImports } from "./parse/imports.ts";
import { parse } from "./parse/sections.ts";
import { generate } from "./template/codegen.ts";
import { compileTemplate } from "./template/scanner.ts";
import { compileStyleResult, type StyleDep } from "./style/sass.ts";
import { extractSourceMap } from "./sourcemap/extract.ts";

export { LuciaError } from "./errors.ts";
export { CODES, type ErrorCodeName } from "./errors/codes.ts";
export { hash } from "./id.ts";
export { parse } from "./parse/sections.ts";
export { depsCurrent, forgetStyles, type StyleDep } from "./style/sass.ts";
export { scopeCss } from "./style/modes.ts";
export { compileTemplate } from "./template/scanner.ts";

export interface CompileOptions {
  /** Dev builds keep runtime error locations. Default false. */
  dev?: boolean;
}

export interface CompileResult {
  code: string;
  css: string;
  id: string;
  /** A version 3 source map for `code`, as JSON. */
  map: string;
  /** The Sass files the styles imported. */
  deps: StyleDep[];
  /** Time spent in the Sass compiler. Zero when every style came from the cache. */
  sassMs: number;
  /** The script and markup only. If this is unchanged, a change to the styles alone needs no reload. */
  scriptAndMarkup: string;
}

export function compile(source: string, file: string, options: CompileOptions = {}): CompileResult {
  const parsed = parse(source, file);
  const id = hash(file);
  const styles = parsed.styles.map((style, index) => compileStyleResult(style, file, id, index));
  const css = styles.map((style) => style.css).join("\n");
  const deps = styles.flatMap((style) => style.deps);
  const sassMs = styles.reduce((sum, style) => sum + style.sassMs, 0);
  const scriptAndMarkup = JSON.stringify([
    parsed.script?.content,
    parsed.script?.attrs,
    parsed.markup,
  ]);
  const { imports, body, components } = splitImports(parsed.script, file);
  const template = compileTemplate(parsed.markup, file, parsed.markupLine, components);
  const generated = generate({
    imports,
    body,
    bodyLine: parsed.script?.line ?? 1,
    template,
    css,
    id,
    file: relative(process.cwd(), file),
    dev: options.dev ?? false,
  });
  const { code, map } = extractSourceMap(generated, file, source);
  return { code, css, id, map, deps, sassMs, scriptAndMarkup };
}
