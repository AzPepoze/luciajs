import { describe, expect, test } from "bun:test";
import { guidePath, normalizePath, pageLink, referencePath } from "./page-link.ts";

describe("pageLink", () => {
  test("writes the page path in front of the hash", () => {
    expect(pageLink(guidePath, "store-from")).toBe("/guide#store-from");
    expect(pageLink(referencePath, "store-from")).toBe("/reference#store-from");
  });
});

describe("normalizePath", () => {
  test("drops a trailing slash but keeps the root", () => {
    expect(normalizePath("/guide/")).toBe("/guide");
    expect(normalizePath("/")).toBe("/");
  });
});
