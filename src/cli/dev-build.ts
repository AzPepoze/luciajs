import type { ModuleChange } from "@bun-plugin/change.ts";
import { formatBuildFailure } from "./build-errors.ts";
import { assetKey, bundleApp } from "./bundle.ts";
import { colorEnabled } from "./color.ts";
import { withReloadClient } from "./reload-client.ts";
import { addBundleStep, now, type Steps } from "./timings.ts";

export type Assets = Map<string, Blob>;

export type DevBuild =
  | { ok: true; assets: Assets; changes: ModuleChange[]; steps: Steps }
  | { ok: false; messages: string[] };

export async function buildDev(dir: string): Promise<DevBuild> {
  const steps: Steps = {};
  const changes: ModuleChange[] = [];
  const start = now();
  const result = await bundleApp({
    dir,
    minify: false,
    dev: true,
    steps,
    onChange: (change) => changes.push(change),
  });
  addBundleStep(steps, now() - start);
  if (!result.success)
    return { ok: false, messages: [formatBuildFailure(result.logs, colorEnabled())] };
  const entries = await Promise.all(result.outputs.map(toEntry));
  return { ok: true, assets: new Map(entries), changes, steps };
}

async function toEntry(output: Blob & { path: string }): Promise<[string, Blob]> {
  const key = assetKey(output.path);
  if (!output.path.endsWith(".html")) return [key, output];
  const html = withReloadClient(await output.text());
  return [key, new Blob([html], { type: output.type })];
}
