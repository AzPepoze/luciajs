import type { FormatParts } from "./format.ts";
import { protectFlowTags, restoreFlowTags } from "./flow-placeholders.ts";
import { protectExpressions, restoreExpressions } from "./format-expressions.ts";

type Parser = "typescript" | "css" | "scss" | "html";

/** Prettier, as the Node package and the standalone browser build both export it. */
export interface PrettierLike {
  format(code: string, options: Record<string, unknown>): Promise<string>;
  plugins?: readonly unknown[];
}

export interface PrettierParts {
  /** Formats one embedded part with the given Prettier parser. */
  formatPart(code: string, parser: Parser): Promise<string>;
  /** The same formatter, for `formatLusia`. */
  parts: FormatParts;
}

/**
 * The embedded-part formatters of every Lusia editor adapter: the option and plugin
 * handling lives here, so Node and browser only say how they load Prettier.
 */
export function prettierParts(
  load: () => Promise<PrettierLike>,
  config: Record<string, unknown> = {},
): PrettierParts {
  async function formatPart(code: string, parser: Parser): Promise<string> {
    if (code.trim() === "") return "";
    const prettier = await load();
    const options = { ...config, parser, ...pluginsOf(prettier) };
    return (await prettier.format(code, options)).trim();
  }
  return {
    formatPart,
    parts: {
      script: (code) => formatPart(code, "typescript"),
      style: (code, plainCss) => formatPart(code, plainCss ? "css" : "scss"),
      markup: async (markup) => {
        const flow = protectFlowTags(markup);
        const protectedMarkup = protectExpressions(flow.text);
        const html = await formatPart(protectedMarkup.text, "html");
        return restoreExpressions(restoreFlowTags(html, flow.tags), protectedMarkup.expressions);
      },
    },
  };
}

function pluginsOf(prettier: PrettierLike): { plugins?: readonly unknown[] } {
  return prettier.plugins ? { plugins: prettier.plugins } : {};
}
