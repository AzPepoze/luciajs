import { describe, expect, test } from "bun:test";
import { LuciaError, parse } from "../src/parse.ts";

const FILE = "Card.lucia";

describe("parse", () => {
  test("splits script, style and markup", () => {
    const source = [
      "<script>",
      "const a = 1;",
      "</script>",
      "",
      "<h1>Hi</h1>",
      "",
      '<style lang="css">',
      "h1 { color: red; }",
      "</style>",
    ].join("\n");

    const parsed = parse(source, FILE);
    expect(parsed.script?.content).toBe("\nconst a = 1;\n");
    expect(parsed.style?.content).toBe("\nh1 { color: red; }\n");
    expect(parsed.markup).toBe("<h1>Hi</h1>");
  });

  test("parses attributes on sections", () => {
    const parsed = parse('<style lang="css">a {}</style>', FILE);
    expect(parsed.style?.attrs).toEqual({ lang: "css" });
    expect(parsed.script).toBeNull();
  });

  test("reports the line where section content starts", () => {
    const source = ["<h1>Title</h1>", "", "<script>", "export const x = 1;", "</script>"].join("\n");
    const parsed = parse(source, FILE);
    expect(parsed.script?.line).toBe(3);
  });

  test("ignores <script> and <style> inside {} expressions and comments", () => {
    const source = '<script>const a = 1;</script>\n<p>{"<script>x</script>"}</p>\n<!-- <style>p{}</style> -->';
    const parsed = parse(source, FILE);
    expect(parsed.script?.content).toBe("const a = 1;");
    expect(parsed.style).toBeNull();
    expect(parsed.markup).toBe('<p>{"<script>x</script>"}</p>\n<!-- <style>p{}</style> -->');
  });

  test("throws LuciaError on an unclosed section", () => {
    expect(() => parse("<style>p {}", FILE)).toThrow("unclosed <style>");
  });

  test("throws LuciaError on a duplicate <script>", () => {
    const source = "<script>const a = 1;</script>\n<script>const b = 2;</script>";
    expect(() => parse(source, FILE)).toThrow(LuciaError);
    expect(() => parse(source, FILE)).toThrow("only one <script> is allowed");
  });
});
