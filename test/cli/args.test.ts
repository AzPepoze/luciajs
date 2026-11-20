import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { parseCommand, UsageError } from "@cli/args.ts";

const NO_ENV = {};

describe("parseCommand", () => {
  test("build uses the defaults", () => {
    expect(parseCommand(["build"], NO_ENV)).toEqual({
      name: "build",
      dir: ".",
      outdir: resolve("dist"),
      minify: true,
      routes: [],
      quiet: false,
      lazy: { mode: "smart", prefetch: "idle" },
    });
  });

  test("build reads its options", () => {
    expect(parseCommand(["build", "app", "--outdir", "out", "--no-minify"], NO_ENV)).toEqual({
      name: "build",
      dir: "app",
      outdir: resolve("out"),
      minify: false,
      routes: [],
      quiet: false,
      lazy: { mode: "smart", prefetch: "idle" },
    });
  });

  test("--quiet hides the timing output for build and dev", () => {
    expect(parseCommand(["build", "--quiet"], NO_ENV)).toMatchObject({ quiet: true });
    expect(parseCommand(["dev", "--quiet"], NO_ENV)).toMatchObject({ quiet: true });
  });

  test("dev defaults to port 3000, uses PORT, and --port wins", () => {
    expect(parseCommand(["dev"], NO_ENV)).toEqual({
      name: "dev",
      dir: ".",
      port: 3000,
      quiet: false,
      lazy: { mode: "smart", prefetch: "idle" },
    });
    expect(parseCommand(["dev"], { PORT: "3100" })).toEqual({
      name: "dev",
      dir: ".",
      port: 3100,
      quiet: false,
      lazy: { mode: "smart", prefetch: "idle" },
    });
    expect(parseCommand(["dev", "--port", "3196"], { PORT: "3100" })).toEqual({
      name: "dev",
      dir: ".",
      port: 3196,
      quiet: false,
      lazy: { mode: "smart", prefetch: "idle" },
    });
  });

  test("format takes paths and its flags, defaulting to the current folder", () => {
    expect(parseCommand(["format"], NO_ENV)).toEqual({
      name: "format",
      paths: ["."],
      check: false,
      quiet: false,
    });
    expect(parseCommand(["format", "src", "app/**/*.lusia", "--check", "--quiet"], NO_ENV)).toEqual(
      {
        name: "format",
        paths: ["src", "app/**/*.lusia"],
        check: true,
        quiet: true,
      },
    );
  });

  test("lint takes paths and its flags, defaulting to the current folder", () => {
    expect(parseCommand(["lint"], NO_ENV)).toEqual({
      name: "lint",
      paths: ["."],
      fix: false,
      maxWarnings: Number.POSITIVE_INFINITY,
      quiet: false,
      rules: undefined,
    });
    expect(
      parseCommand(["lint", "src", "--fix", "--max-warnings", "0", "--quiet"], NO_ENV),
    ).toEqual({
      name: "lint",
      paths: ["src"],
      fix: true,
      maxWarnings: 0,
      quiet: true,
      rules: undefined,
    });
  });

  test("help and unknown commands", () => {
    expect(parseCommand([], NO_ENV)).toEqual({ name: "help" });
    expect(() => parseCommand(["serve"], NO_ENV)).toThrow(UsageError);
  });

  test("bad options raise a usage error", () => {
    expect(() => parseCommand(["build", "--bogus"], NO_ENV)).toThrow(UsageError);
    expect(() => parseCommand(["dev", "--port", "70000"], NO_ENV)).toThrow(UsageError);
    expect(() => parseCommand(["build", "a", "b"], NO_ENV)).toThrow(UsageError);
    expect(() => parseCommand(["format", "--bogus"], NO_ENV)).toThrow(UsageError);
    expect(() => parseCommand(["lint", "--bogus"], NO_ENV)).toThrow(UsageError);
    expect(() => parseCommand(["lint", "--max-warnings", "-1"], NO_ENV)).toThrow(UsageError);
    expect(() => parseCommand(["lint", "--max-warnings", "1.5"], NO_ENV)).toThrow(UsageError);
    expect(() => parseCommand(["lint", "--max-warnings"], NO_ENV)).toThrow(UsageError);
  });
});
