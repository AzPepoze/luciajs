import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseConfig, readConfig } from "@cli/config.ts";
import { parseCommand } from "@cli/args.ts";

function appWith(json: string): string {
  const dir = mkdtempSync(join(tmpdir(), "lucia-config-"));
  writeFileSync(join(dir, "lucia.config.json"), json);
  return dir;
}

describe("readConfig", () => {
  test("a missing file means no settings", () => {
    expect(readConfig(mkdtempSync(join(tmpdir(), "lucia-empty-")))).toEqual({});
  });

  test("reads every known key", () => {
    const config = readConfig(
      appWith(
        JSON.stringify({
          $schema: "./node_modules/lucia/config.schema.json",
          outdir: "out",
          minify: false,
          routes: ["/guide"],
          dev: { port: 4000 },
          lazy: { mode: "all", prefetch: "view" },
        }),
      ),
    );
    expect(config).toEqual({
      outdir: "out",
      minify: false,
      routes: ["/guide"],
      dev: { port: 4000 },
      lazy: { mode: "all", prefetch: "view" },
    });
  });
});

describe("parseConfig errors", () => {
  test.each([
    [
      '{ "outdr": "x" }',
      'unknown key "outdr", allowed: $schema, outdir, minify, routes, dev, lazy',
    ],
    ['{ "lazy": { "mode": "some" } }', '"lazy.mode" must be one of: smart, all, off'],
    ['{ "lazy": { "prefetch": "soon" } }', '"lazy.prefetch" must be one of: idle, view, none'],
    ['{ "dev": { "port": 70000 } }', '"dev.port" must be a whole number from 0 to 65535'],
    ['{ "dev": { "host": "x" } }', 'unknown key "host" in "dev", allowed: port'],
    ['{ "routes": ["guide"] }', 'invalid route "guide", use a path such as /guide'],
    ['{ "minify": "yes" }', '"minify" must be true or false'],
    ["[]", "the file must hold a JSON object"],
    ["{ nope", "not valid JSON"],
  ])("%s names the problem", (text, detail) => {
    expect(() => parseConfig(text)).toThrow(`lucia.config.json: ${detail}`);
  });
});

describe("CLI merge", () => {
  test("the file sets the build options and flags win", () => {
    const dir = appWith(JSON.stringify({ outdir: "out", minify: false, routes: ["/guide"] }));
    expect(parseCommand(["build", dir], {})).toMatchObject({
      outdir: "out",
      minify: false,
      routes: ["/guide"],
    });
    expect(
      parseCommand(["build", dir, "--outdir", "flag", "--routes", "/reference"], {}),
    ).toMatchObject({
      outdir: "flag",
      routes: ["/reference"],
    });
  });

  test("the port comes from the flag, then PORT, then the file, then 3000", () => {
    const dir = appWith(JSON.stringify({ dev: { port: 4000 } }));
    expect(parseCommand(["dev", dir], {})).toMatchObject({ port: 4000 });
    expect(parseCommand(["dev", dir], { PORT: "5000" })).toMatchObject({
      port: 5000,
    });
    expect(parseCommand(["dev", dir, "--port", "6000"], { PORT: "5000" })).toMatchObject({
      port: 6000,
    });
    expect(parseCommand(["dev"], {})).toMatchObject({ port: 3000 });
  });
});
