import { format, resolveConfig, type Options } from "prettier";
import type { FormatParts } from "@language/format/format.ts";
import { prettierParts } from "@language/format/prettier-parts.ts";

/** The Prettier configuration a file is formatted with. */
export async function prettierConfigFor(file: string): Promise<Options> {
  return (await resolveConfig(file)) ?? {};
}

/** The embedded-part formatter for one Prettier configuration. */
export function partsFor(config: Options): FormatParts {
  return prettierParts(
    async () => ({
      format: (code, options) => format(code, options as Options),
    }),
    config as Record<string, unknown>,
  ).parts;
}
