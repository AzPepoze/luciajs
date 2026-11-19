import { describe, expect, test } from "bun:test";
import { LuciaError } from "@compiler/errors.ts";
import { compileStyle } from "@compiler/style/sass.ts";
import { FILE, ID, SCOPED, ROOT, TREE } from "./fixtures.ts";

describe("compileStyle", () => {
  test("compiles SCSS nesting and variables, then scopes", () => {
    const style = { content: "$c: red;\n.a { color: $c; &:hover { color: blue; } }", attrs: {}, line: 1 };
    const out = compileStyle(style, FILE, ID);
    expect(out).toContain(`.a${TREE} {`);
    expect(out).toContain("color: red;");
    expect(out).toContain(`.a:hover${TREE} {`);
    expect(out).not.toContain("$c");
  });

  test("<style scoped> uses the scoped filter", () => {
    const style = { content: ".a { color: red; }", attrs: { scoped: "" }, line: 1 };
    expect(compileStyle(style, FILE, ID)).toContain(`.a${SCOPED} {`);
  });

  test("<style global> leaves selectors unscoped", () => {
    const style = { content: "body { margin: 0; }", attrs: { global: "" }, line: 1 };
    const out = compileStyle(style, FILE, ID);
    expect(out).toContain("body {");
    expect(out).not.toContain(ROOT);
  });

  test('lang="css" skips the Sass compiler', () => {
    const style = { content: "h1 { color: $c; }", attrs: { lang: "css" }, line: 1 };
    const out = compileStyle(style, FILE, ID);
    expect(out).toContain("color: $c;");
    expect(out).toContain(`h1${TREE}`);
  });

  test("SCSS syntax error throws LuciaError with a line inside the file", () => {
    const style = { content: "\n.a {\n  color: red;\n", attrs: {}, line: 10 };
    try {
      compileStyle(style, FILE, ID);
      throw new Error("expected compileStyle to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(LuciaError);
      const lucia = error as LuciaError;
      expect(lucia.line).toBeGreaterThanOrEqual(style.line);
      expect(lucia.line).toBeLessThan(style.line + style.content.split("\n").length);
    }
  });
});
