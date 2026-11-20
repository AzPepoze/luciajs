import { compile, LuciaError, type CompileResult, type LazyOptions } from "@compiler/index.ts";
import { formatError } from "@cli/format-error.ts";
import { colorEnabled } from "@cli/color.ts";

/** Compiles one .lucia file. A compile error is thrown with its position and hint in the message. */
export function compileFile(
  source: string,
  path: string,
  dev: boolean,
  lazy?: LazyOptions,
): CompileResult {
  try {
    return compile(source, path, { dev, lazy });
  } catch (error) {
    if (error instanceof LuciaError) throw new Error(formatError(error, source, colorEnabled()));
    throw error;
  }
}
