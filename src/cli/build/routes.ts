import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

/** Copies index.html for each client route, so a static host serves deep links. */
export async function writeRouteIndexes(outdir: string, routes: string[]): Promise<void> {
  for (const route of routes) {
    const target = join(outdir, route, "index.html");
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(outdir, "index.html"), target);
  }
}
