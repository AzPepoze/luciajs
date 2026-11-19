import { generate } from "./codegen.ts";
import { parse } from "./parse.ts";
import { compileStyle, hash } from "./style.ts";
import { compileTemplate } from "./template.ts";

export { LuciaError, parse } from "./parse.ts";
export { hash, scopeCss } from "./style.ts";
export { compileTemplate } from "./template.ts";

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
