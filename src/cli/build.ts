import { rm } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { bundleApp, entryPath } from "./bundle.ts";
import { createLogger } from "./log.ts";
import { copyPublic } from "./public.ts";
import { fileRows, formatReport } from "./report.ts";

export interface BuildOptions {
  dir: string;
  outdir: string;
  minify: boolean;
}

export async function runBuild(options: BuildOptions): Promise<number> {
  const log = createLogger("build");
  const dir = resolve(options.dir);
  const outdir = resolve(options.outdir);
  entryPath(dir);
  if (isInside(dir, outdir)) {
    log.error(`the output folder must not contain the app folder: ${outdir}`);
    return 1;
  }

  const started = performance.now();
  await rm(outdir, { recursive: true, force: true });
  const result = await bundleApp({ dir, outdir, minify: options.minify });
  if (!result.success) {
    for (const message of result.logs) log.error(message.message);
    return 1;
  }

  await copyPublic(dir, outdir);
  const rows = await fileRows(outdir);
  process.stdout.write(`${formatReport(rows)}\n`);
  const elapsed = Math.round(performance.now() - started);
  log.info(`built ${rows.length} files into ${relative(process.cwd(), outdir) || "."} in ${elapsed} ms`);
  return 0;
}

function isInside(path: string, folder: string): boolean {
  return path === folder || path.startsWith(`${folder}${sep}`);
}
