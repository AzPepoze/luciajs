import { describe, expect, test } from "bun:test";
import { LuciaError } from "../src/parse.ts";
import { compileStyle, hash, scopeCss } from "../src/style.ts";

const SCOPE = "data-s";
const FILE = `${import.meta.dir}/Card.lucia`;

describe("hash", () => {
  test("is stable and differs by input", () => {
    expect(hash("Card.lucia")).toBe(hash("Card.lucia"));
    expect(hash("Card.lucia")).not.toBe(hash("Other.lucia"));
  });

  test("matches FNV-1a offset basis for empty input", () => {
    expect(hash("")).toBe((0x811c9dc5).toString(36));
  });
});

describe("scopeCss", () => {
  test("scopes each selector in a list", () => {
    const out = scopeCss("h1, .a, p .b { color: red; }", SCOPE);
    expect(out).toContain("h1[data-s], .a[data-s], p .b[data-s] {");
  });

  test("keeps the scope before pseudo-elements", () => {
    const out = scopeCss("p::before { content: 'x'; }", SCOPE);
    expect(out).toContain("p[data-s]::before {");
  });

  test(":global() is left unscoped", () => {
    const out = scopeCss(":global(.x) { color: red; }", SCOPE);
    expect(out).toContain(".x {");
    expect(out).not.toContain("[data-s]");
  });

  test("scopes rules inside @media", () => {
    const out = scopeCss("@media (max-width: 600px) { h1 { color: red; } }", SCOPE);
    expect(out).toContain("@media (max-width: 600px) {");
    expect(out).toContain("h1[data-s] {");
  });

  test("leaves @keyframes untouched", () => {
    const css = "@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }";
    const out = scopeCss(css, SCOPE);
    expect(out).toContain("@keyframes spin {");
    expect(out).toContain("from { transform: rotate(0); }");
    expect(out).not.toContain("[data-s]");
  });
});

describe("compileStyle", () => {
  test("compiles SCSS nesting and variables, then scopes", () => {
    const style = { content: "$c: red;\n.a { color: $c; &:hover { color: blue; } }", attrs: {}, line: 1 };
    const out = compileStyle(style, FILE, SCOPE);
    expect(out).toContain(".a[data-s] {");
    expect(out).toContain("color: red;");
    expect(out).toContain(".a:hover[data-s] {");
    expect(out).not.toContain("$c");
  });

  test('lang="css" skips the Sass compiler', () => {
    const style = { content: "h1 { color: $c; }", attrs: { lang: "css" }, line: 1 };
    const out = compileStyle(style, FILE, SCOPE);
    expect(out).toContain("color: $c;");
    expect(out).toContain("h1[data-s]");
  });

  test("SCSS syntax error throws LuciaError with a line inside the file", () => {
    const style = { content: "\n.a {\n  color: red;\n", attrs: {}, line: 10 };
    try {
      compileStyle(style, FILE, SCOPE);
      throw new Error("expected compileStyle to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(LuciaError);
      const lucia = error as LuciaError;
      expect(lucia.line).toBeGreaterThanOrEqual(style.line);
      expect(lucia.line).toBeLessThan(style.line + style.content.split("\n").length);
    }
  });
});
