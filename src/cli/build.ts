import { mkdir, rm } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { formatBuildFailure } from "./build-errors.ts";
import { assetKey, bundleApp, entryPath } from "./bundle.ts";
import { colorEnabled } from "./color.ts";
import { createLogger } from "./log.ts";
import { copyPublic } from "./public.ts";
import { writeRouteIndexes } from "./routes.ts";
import { fileRows, formatReport } from "./report.ts";
import { addBundleStep, addStep, formatBuildSteps, now, type Steps } from "./timings.ts";

export interface BuildOptions {
  dir: string;
  outdir: string;
  minify: boolean;
  routes?: string[];
  /** Hides the step table. */
  quiet?: boolean;
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

  const steps: Steps = {};
  const started = now();
  await rm(outdir, { recursive: true, force: true });
  const bundleStart = now();
  const result = await bundleApp({ dir, minify: options.minify, dev: false, steps });
  addBundleStep(steps, now() - bundleStart);
  if (!result.success) {
    process.stderr.write(`${formatBuildFailure(result.logs, colorEnabled())}\n`);
    return 1;
  }

  const writeStart = now();
  await writeOutputs(outdir, result.outputs);
  await writeRouteIndexes(outdir, options.routes ?? []);
  addStep(steps, "write", now() - writeStart);

  const copyStart = now();
  await copyPublic(dir, outdir);
  addStep(steps, "copy", now() - copyStart);
  steps.total = now() - started;

  const rows = await fileRows(outdir);
  if (!options.quiet) process.stdout.write(`${formatBuildSteps(steps)}\n\n`);
  process.stdout.write(`${formatReport(rows)}\n`);
  log.info(`built ${rows.length} files into ${relative(process.cwd(), outdir) || "."}`);
  return 0;
}

async function writeOutputs(outdir: string, outputs: Bun.BuildArtifact[]): Promise<void> {
  await Promise.all(
    outputs.map(async (output) => {
      const target = join(outdir, assetKey(output.path));
      await mkdir(dirname(target), { recursive: true });
      await Bun.write(target, output);
    }),
  );
}

function isInside(path: string, folder: string): boolean {
  return path === folder || path.startsWith(`${folder}${sep}`);
}
