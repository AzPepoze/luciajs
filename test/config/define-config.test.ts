import { describe, expect, test } from "bun:test";
import { defineConfig } from "../../src/config/index.ts";

describe("defineConfig", () => {
  test("returns the same object", () => {
    const config = { outdir: "out", animate: { duration: 500 } };
    expect(defineConfig(config)).toBe(config);
  });
});
