import { format, resolveConfig, type Options } from "prettier";
import type { FormatParts } from "@language/format.ts";
import { prettierParts } from "@language/prettier-parts.ts";

/** Prettier for each embedded part, with the config Prettier finds for the file. */
export async function partsFor(file: string): Promise<FormatParts> {
  const config = (await resolveConfig(file)) ?? {};
  return prettierParts(
    async () => ({ format: (code, options) => format(code, options as Options) }),
    config as Record<string, unknown>,
  ).parts;
}
