import * as sass from "sass";
import { dirname } from "node:path";
import { LuciaError } from "../errors.ts";
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
    const span = (error as sass.Exception).span;
    const line = span ? style.line + span.start.line : style.line;
    const column = span ? span.start.column + 1 : 1;
    throw new LuciaError((error as sass.Exception).sassMessage ?? String(error), file, line, column);
  }
}
