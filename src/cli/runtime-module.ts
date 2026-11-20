import { fileURLToPath } from "node:url";

export const RUNTIME_PATH = "/__lusia/runtime.js";

const RUNTIME_ENTRY = fileURLToPath(new URL("../runtime/all.ts", import.meta.url));

let built: Promise<Blob> | undefined;

/** The whole runtime as one browser module, built once per dev server. */
export function runtimeModule(): Promise<Blob> {
  built ??= buildRuntime();
  return built;
}

async function buildRuntime(): Promise<Blob> {
  const result = await Bun.build({
    entrypoints: [RUNTIME_ENTRY],
    format: "esm",
    target: "browser",
    minify: false,
    throw: true,
  });
  return new Blob([await result.outputs[0]!.text()], { type: "text/javascript" });
}
