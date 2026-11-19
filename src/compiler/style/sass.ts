import * as sass from "sass";
import { dirname } from "node:path";
import { luciaError } from "../errors/create.ts";
import type { Section } from "../parse/sections.ts";
import { scopeCss, styleMode } from "./modes.ts";

export function compileStyle(style: Section, file: string, id: string): string {
  const isPlainCss = style.attrs.lang === "css";
  const css = isPlainCss ? style.content : compileScss(style, file);
  return scopeCss(css, id, styleMode(style)).trim();
}

function compileScss(style: Section, file: string): string {
  try {
    return sass.compileString(style.content, { loadPaths: [dirname(file)], style: "expanded" }).css;
  } catch (error) {
    const sassError = error as sass.Exception;
    const span = sassError.span;
    const line = span ? style.line + span.start.line : style.line;
    const column = span ? span.start.column + 1 : 1;
    throw luciaError(
      "L1005",
      { message: sassError.sassMessage ?? String(error) },
      { file, line, column },
    );
  }
}
