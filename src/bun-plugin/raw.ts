import type { PluginBuilder } from "bun";
import { dirname } from "node:path";

const RAW_SUFFIX = "?raw";
const RAW_NAMESPACE = "lusia-raw";

export function setupRaw(build: PluginBuilder): void {
  build.onResolve({ filter: /\?raw$/ }, ({ path, importer }) => ({
    path: resolveRawPath(path, importer) + RAW_SUFFIX,
    namespace: RAW_NAMESPACE,
  }));

  build.onLoad({ filter: /.*/, namespace: RAW_NAMESPACE }, async ({ path }) => ({
    contents: `export default ${JSON.stringify(await Bun.file(path.slice(0, -RAW_SUFFIX.length)).text())};`,
    loader: "js",
  }));
}

function resolveRawPath(specifier: string, importer: string): string {
  const withoutQuery = specifier.slice(0, -RAW_SUFFIX.length);
  const base = importer ? dirname(importer) : process.cwd();
  return Bun.resolveSync(withoutQuery, base);
}
