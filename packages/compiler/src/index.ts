import { generate } from "./codegen.ts";
import { parse } from "./parse.ts";
import { compileStyle, hash } from "./style.ts";

export { LuciaError, parse } from "./parse.ts";
export { hash, scopeCss } from "./style.ts";

export interface CompileResult {
	code: string;
	css: string;
	scope: string;
}

export function compile(source: string, file: string): CompileResult {
	const parsed = parse(source, file);
	const scope = `data-l-${hash(file)}`;
	const css = parsed.style ? compileStyle(parsed.style, file, scope) : "";
	const script = parsed.script?.content ?? "";
	const code = generate({ script, markup: parsed.markup, css, scope });
	return { code, css, scope };
}
