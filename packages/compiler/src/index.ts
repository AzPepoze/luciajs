import { hash } from "./id.ts";
import { parse } from "./parse/sections.ts";
import { generate } from "./template/codegen.ts";
import { compileTemplate } from "./template/scanner.ts";
import { compileStyle } from "./style/sass.ts";

export { LuciaError } from "./errors.ts";
export { hash } from "./id.ts";
export { parse } from "./parse/sections.ts";
export { scopeCss } from "./style/modes.ts";
export { compileTemplate } from "./template/scanner.ts";

export interface CompileResult {
  code: string;
  css: string;
  id: string;
}

export function compile(source: string, file: string): CompileResult {
  const parsed = parse(source, file);
  const id = hash(file);
  const css = parsed.styles.map((style) => compileStyle(style, file, id)).join("\n");
  const script = parsed.script?.content ?? "";
  const template = compileTemplate(parsed.markup, file, parsed.markupLine);
  const code = generate({ script, template, css, id });
  return { code, css, id };
}
