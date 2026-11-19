import { relative } from "node:path";
import { hash } from "./id.ts";
import { splitImports } from "./parse/imports.ts";
import { parse } from "./parse/sections.ts";
import { generate } from "./template/codegen.ts";
import { compileTemplate } from "./template/scanner.ts";
import { compileStyle } from "./style/sass.ts";
import { extractSourceMap } from "./sourcemap/extract.ts";

export { LuciaError } from "./errors.ts";
export { CODES, type ErrorCodeName } from "./errors/codes.ts";
export { hash } from "./id.ts";
export { parse } from "./parse/sections.ts";
export { scopeCss } from "./style/modes.ts";
export { compileTemplate } from "./template/scanner.ts";

export interface CompileOptions {
  /** Dev builds keep runtime error locations and an inline source map. Default false. */
  dev?: boolean;
}

export interface CompileResult {
  code: string;
  css: string;
  id: string;
  /** A version 3 source map for `code`, as JSON. */
  map: string;
}

export function compile(source: string, file: string, options: CompileOptions = {}): CompileResult {
  const parsed = parse(source, file);
  const id = hash(file);
  const css = parsed.styles.map((style) => compileStyle(style, file, id)).join("\n");
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
  return { code, css, id, map };
}
