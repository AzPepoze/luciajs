import { describe, expect, test } from "bun:test";
import { hash } from "../src/id.ts";

describe("hash", () => {
  test("is stable and differs by input", () => {
    expect(hash("Card.lucia")).toBe(hash("Card.lucia"));
    expect(hash("Card.lucia")).not.toBe(hash("Other.lucia"));
  });

  test("matches FNV-1a offset basis for empty input", () => {
    expect(hash("")).toBe((0x811c9dc5).toString(36));
  });
});
