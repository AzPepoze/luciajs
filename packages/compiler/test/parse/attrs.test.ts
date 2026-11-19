import { describe, expect, test } from "bun:test";
import { parseAttrs } from "../../src/parse/attrs.ts";
import { parse } from "../../src/parse/sections.ts";

const FILE = "Card.lucia";

describe("parseAttrs", () => {
  test("parses valued and bare attributes on sections", () => {
    const parsed = parse('<style lang="css">a {}</style>', FILE);
    expect(parsed.styles[0]?.attrs).toEqual({ lang: "css" });
    expect(parsed.script).toBeNull();
  });

  test("bare attributes get an empty value", () => {
    expect(parseAttrs(' lang="css" scoped')).toEqual({ lang: "css", scoped: "" });
  });
});
