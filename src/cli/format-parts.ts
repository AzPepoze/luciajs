import { format, resolveConfig, type Options } from "prettier";
import { protectExpressions, restoreExpressions } from "@language/format-expressions.ts";
import type { FormatParts } from "@language/format.ts";

/** Prettier for each embedded part, with the config Prettier finds for the file. */
export async function partsFor(file: string): Promise<FormatParts> {
  const config = (await resolveConfig(file)) ?? {};
  return {
    script: (code) => formatCode(code, "typescript", config),
    style: (code, plainCss) => formatCode(code, plainCss ? "css" : "scss", config),
    markup: (markup) => formatMarkup(markup, config),
  };
}

async function formatCode(
  code: string,
  parser: "typescript" | "css" | "scss",
  config: Options,
): Promise<string> {
  if (code.trim() === "") return "";
  return (await format(code, { ...config, parser })).trim();
}

async function formatMarkup(markup: string, config: Options): Promise<string> {
  const protectedMarkup = protectExpressions(markup);
  const html = await format(protectedMarkup.text, { ...config, parser: "html" });
  return restoreExpressions(html, protectedMarkup.expressions).trim();
}
