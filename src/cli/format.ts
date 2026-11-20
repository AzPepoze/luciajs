import { relative } from "node:path";
import { formatLusia } from "@language/format.ts";
import { ANSI, colorEnabled, paint } from "./color.ts";
import { collectFiles } from "./files.ts";
import { partsFor } from "./format-parts.ts";

export interface FormatOptions {
  paths: string[];
  check: boolean;
  quiet: boolean;
}

/** Formats the .lusia files in place, or lists the ones that would change with `--check`. */
export async function runFormat(options: FormatOptions): Promise<number> {
  const files = await collectFiles(options.paths);
  const color = colorEnabled();
  const changed: string[] = [];
  const errors: string[] = [];
  for (const file of files) {
    try {
      const source = await Bun.file(file).text();
      const formatted = await formatLusia(source, await partsFor(file));
      if (formatted === source) continue;
      if (!options.check) await Bun.write(file, formatted);
      changed.push(display(file));
    } catch (error) {
      errors.push(`${display(file)}: ${messageOf(error)}`);
    }
  }
  report(options, files.length, changed, errors, color);
  return errors.length > 0 || (options.check && changed.length > 0) ? 1 : 0;
}

function report(
  options: FormatOptions,
  count: number,
  changed: string[],
  errors: string[],
  color: boolean,
): void {
  for (const error of errors) {
    const label = paint("error", ANSI.red);
    process.stderr.write(`${color ? label : "error"} ${error}\n`);
  }
  if (options.check) {
    for (const path of changed)
      process.stdout.write(`${color ? paint(path, ANSI.yellow) : path}\n`);
    if (!options.quiet) process.stdout.write(`${summary(count, changed.length)}\n`);
    return;
  }
  if (!options.quiet) process.stdout.write(`${writtenSummary(count, changed.length)}\n`);
}

function summary(count: number, changed: number): string {
  if (changed === 0) {
    return count === 1 ? "The file is formatted." : `All ${count} files are formatted.`;
  }
  return `${changed} of ${count} ${plural(count)} would be reformatted.`;
}

function writtenSummary(count: number, changed: number): string {
  if (changed === 0) return `${count} ${plural(count)} already formatted.`;
  return `Formatted ${changed} of ${count} ${plural(count)}.`;
}

function plural(count: number): string {
  return count === 1 ? "file" : "files";
}

function display(file: string): string {
  return relative(process.cwd(), file) || file;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
