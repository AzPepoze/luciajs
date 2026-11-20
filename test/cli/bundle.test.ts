import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { bundleApp } from "@cli/bundle.ts";
import { runBuild } from "@cli/build.ts";
import { buildDev } from "@cli/dev-build.ts";

const REPO = new URL("../../", import.meta.url).pathname;
const LAZY_MARKER = "lazy-chunk-marker-7f3";
const SCRIPT = /\.js$/;

let app: string;

beforeAll(async () => {
  app = await mkdtemp(join(tmpdir(), "lucia-bundle-"));
  await mkdir(join(app, "node_modules"));
  await symlink(REPO, join(app, "node_modules", "lucia"), "dir");
  await writeFile(
    join(app, "index.html"),
    '<!doctype html><html><body><script type="module" src="./main.ts"></script></body></html>\n',
  );
  await writeFile(join(app, "main.ts"), 'import("./lazy.ts").then((m) => m.run());\n');
  await writeFile(join(app, "lazy.ts"), `export function run() { return "${LAZY_MARKER}"; }\n`);
});

afterAll(async () => {
  await rm(app, { recursive: true, force: true });
});

describe("splitting", () => {
  test("a dynamic import becomes a separate chunk file", async () => {
    const result = await bundleApp({ dir: app, minify: false, dev: false });
    expect(result.success).toBe(true);
    const scripts = result.outputs.filter((output) => SCRIPT.test(output.path));
    expect(scripts).toHaveLength(2);
    const withLazy = [];
    for (const script of scripts)
      if ((await script.text()).includes(LAZY_MARKER)) withLazy.push(script);
    expect(withLazy).toHaveLength(1);
  });

  test("lucia build writes the lazy chunk next to the entry", async () => {
    const outdir = await mkdtemp(join(tmpdir(), "lucia-bundle-out-"));
    expect(await runBuild({ dir: app, outdir, minify: true, quiet: true })).toBe(0);
    const files = await readdir(outdir);
    const scripts = files.filter((file) => SCRIPT.test(file));
    expect(scripts).toHaveLength(2);
    const texts = await Promise.all(scripts.map((file) => readFile(join(outdir, file), "utf8")));
    expect(texts.filter((text) => text.includes(LAZY_MARKER))).toHaveLength(1);
    await rm(outdir, { recursive: true, force: true });
  });

  test("dev builds serve the lazy chunk as its own asset", async () => {
    const result = await buildDev(app);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const scripts = [...result.assets.entries()].filter(([key]) => SCRIPT.test(key));
    expect(scripts).toHaveLength(2);
    const texts = await Promise.all(scripts.map(([, blob]) => blob.text()));
    expect(texts.filter((text) => text.includes(LAZY_MARKER))).toHaveLength(1);
  });
});
