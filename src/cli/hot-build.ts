import { lusia } from "@bun-plugin/index.ts";
import { basename } from "node:path";
import { formatBuildFailure } from "./build-errors.ts";
import { colorEnabled } from "./color.ts";
import { isShimInput, RUNTIME_SPECIFIER, runtimeShim } from "./runtime-shim.ts";

export interface HotModule {
  /** Where the dev server serves the module. */
  url: string;
  /**
   * True when the module bundles only `.lusia` files. Any other file would be copied into the
   * module, and its state would not be shared with the page.
   */
  onlyComponents: boolean;
  body: Blob;
}

export type HotBuild = { ok: true; module: HotModule } | { ok: false; messages: string[] };

/** Builds one `.lusia` file as its own module, for the browser to import after an edit. */
export interface HotBuilder {
  build(file: string): Promise<HotBuild>;
}

export function createHotBuilder(): HotBuilder {
  let sequence = 0;

  return {
    async build(file) {
      const result = await Bun.build({
        entrypoints: [file],
        format: "esm",
        target: "browser",
        minify: false,
        throw: false,
        metafile: true,
        external: [RUNTIME_SPECIFIER],
        plugins: [lusia({ dev: true }), runtimeShim()],
      });
      if (!result.success)
        return { ok: false, messages: [formatBuildFailure(result.logs, colorEnabled())] };
      const body = new Blob([await result.outputs[0]!.text()], { type: "text/javascript" });
      const inputs = Object.keys(result.metafile!.inputs);
      const onlyComponents = inputs.every(
        (input) => input.endsWith(".lusia") || isShimInput(input),
      );
      sequence++;
      const url = `/__lusia/hot/${Date.now()}-${sequence}-${encodeURIComponent(basename(file))}.js`;
      return { ok: true, module: { url, onlyComponents, body } };
    },
  };
}
