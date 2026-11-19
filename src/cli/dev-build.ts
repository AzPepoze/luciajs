import { bundleApp } from "./bundle.ts";
import { withReloadClient } from "./reload-client.ts";

export type Assets = Map<string, Blob>;

export type DevBuild = { ok: true; assets: Assets } | { ok: false; messages: string[] };

const INDEX_KEY = "index.html";

/** The key an output path or URL path is stored under: "./a.js" and "/a.js" both give "a.js". */
export function assetKey(path: string): string {
  const key = path.replace(/^\.?\//, "");
  return key || INDEX_KEY;
}

export async function buildDev(dir: string): Promise<DevBuild> {
  const result = await bundleApp({ dir, minify: false, dev: true });
  if (!result.success) return { ok: false, messages: result.logs.map((log) => log.message) };
  const entries = await Promise.all(result.outputs.map(toEntry));
  return { ok: true, assets: new Map(entries) };
}

async function toEntry(output: Blob & { path: string }): Promise<[string, Blob]> {
  const key = assetKey(output.path);
  if (!output.path.endsWith(".html")) return [key, output];
  const html = withReloadClient(await output.text());
  return [key, new Blob([html], { type: output.type })];
}
