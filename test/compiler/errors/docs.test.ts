import { describe, expect, test } from "bun:test";
import { CODES } from "@compiler/errors/codes.ts";

const DOCS = new URL("../../../docs/errors.md", import.meta.url).pathname;

describe("docs/errors.md", () => {
  test("has a heading for every code in the table", async () => {
    const text = await Bun.file(DOCS).text();
    const missing = Object.keys(CODES).filter((code) => !text.includes(`## ${code}\n`));
    expect(missing).toEqual([]);
  });
});
