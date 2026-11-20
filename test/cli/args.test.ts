import { describe, expect, test } from "bun:test";
import { parseCommand, UsageError } from "@cli/args.ts";

const NO_ENV = {};

describe("parseCommand", () => {
  test("build uses the defaults", () => {
    expect(parseCommand(["build"], NO_ENV)).toEqual({
      name: "build",
      dir: ".",
      outdir: "dist",
      minify: true,
      routes: [],
      quiet: false,
    });
  });

  test("build reads its options", () => {
    expect(
      parseCommand(["build", "examples/web", "--outdir", "out", "--no-minify"], NO_ENV),
    ).toEqual({
      name: "build",
      dir: "examples/web",
      outdir: "out",
      minify: false,
      routes: [],
      quiet: false,
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
    });
    expect(parseCommand(["dev"], { PORT: "3100" })).toEqual({
      name: "dev",
      dir: ".",
      port: 3100,
      quiet: false,
    });
    expect(parseCommand(["dev", "--port", "3196"], { PORT: "3100" })).toEqual({
      name: "dev",
      dir: ".",
      port: 3196,
      quiet: false,
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
  });
});
