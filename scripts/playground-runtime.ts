// Writes the Lucia runtime that the playground preview loads. Run before `dev` and `build`.
const ENTRY = "examples/web/src/playground/runtime.ts";
const OUTDIR = "examples/web/public/playground";

const result = await Bun.build({
  entrypoints: [ENTRY],
  outdir: OUTDIR,
  naming: "lucia.js",
  target: "browser",
  format: "esm",
  minify: true,
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
