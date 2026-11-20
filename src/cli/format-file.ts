import { formatLusia } from "@language/format.ts";
import { partsFor } from "./format-parts.ts";

/** The result of formatting one file. `formatted` is only sent when the text changed. */
export interface FormatResult {
  file: string;
  changed?: boolean;
  formatted?: string;
  error?: string;
}

/** Formats one `.lusia` file with the shared kernel and Prettier, without writing it. */
export async function formatFile(file: string): Promise<FormatResult> {
  const source = await Bun.file(file).text();
  const formatted = await formatLusia(source, await partsFor(file));
  return formatted === source
    ? { file, changed: false }
    : { file, changed: true, formatted };
}

/** A failed file, in the same shape as `formatFile`, so the caller reports it like any other. */
export function formatFailure(file: string, error: unknown): FormatResult {
  return {
    file,
    error: error instanceof Error ? error.message : String(error),
  };
}
