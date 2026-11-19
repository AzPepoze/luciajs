import { lucia } from "@bun-plugin/index.ts";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const ENTRY_FILE = "index.html";

export function entryPath(dir: string): string {
  const path = join(dir, ENTRY_FILE);
  if (!existsSync(path)) throw new Error(`no ${ENTRY_FILE} in ${dir}`);
  return path;
}

export interface BundleOptions {
  dir: string;
  outdir?: string;
  minify: boolean;
}

export async function bundleApp({ dir, outdir, minify }: BundleOptions): Promise<Bun.BuildOutput> {
  return Bun.build({
    entrypoints: [entryPath(dir)],
    outdir,
    minify,
    sourcemap: "linked",
    throw: false,
    plugins: [lucia()],
  });
}
