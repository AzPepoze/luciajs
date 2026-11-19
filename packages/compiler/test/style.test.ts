import { describe, expect, test } from "bun:test";
import { LuciaError } from "../src/parse.ts";
import { compileStyle, hash, scopeCss } from "../src/style.ts";

const ID = "p";
const FILE = `${import.meta.dir}/Card.lucia`;
const ROOT = `[data-l="p"]`;
const TREE = `:where(${ROOT}, ${ROOT} *)`;
const CHILD = `${ROOT} [data-l]:not(${ROOT})`;
const SCOPED = `${TREE}:not(:where(${CHILD}, ${CHILD} *))`;

describe("hash", () => {
  test("is stable and differs by input", () => {
    expect(hash("Card.lucia")).toBe(hash("Card.lucia"));
    expect(hash("Card.lucia")).not.toBe(hash("Other.lucia"));
  });

  test("matches FNV-1a offset basis for empty input", () => {
    expect(hash("")).toBe((0x811c9dc5).toString(36));
  });
});

describe("scopeCss tree mode", () => {
  test("adds the tree filter to the subject", () => {
    expect(scopeCss(".t { color: red; }", ID, "tree")).toBe(`.t${TREE} { color: red; }\n`);
  });

  test("scopes each selector in a list", () => {
    const out = scopeCss("h1, .a, p .b { color: red; }", ID, "tree");
    expect(out).toContain(`h1${TREE}, .a${TREE}, p .b${TREE} {`);
  });

  test("keeps the filter before pseudo-elements", () => {
    expect(scopeCss("p::before { content: 'x'; }", ID, "tree")).toContain(`p${TREE}::before {`);
  });

  test("keeps the filter before a legacy single-colon pseudo-element", () => {
    expect(scopeCss("p:before { content: 'x'; }", ID, "tree")).toContain(`p${TREE}:before {`);
  });

  test("does not split commas inside :is()", () => {
    const out = scopeCss(".x:is(.a, .b) { color: red; }", ID, "tree");
    expect(out).toContain(`.x:is(.a, .b)${TREE} {`);
  });

  test("keeps an ancestor unscoped and scopes only the subject", () => {
    expect(scopeCss(".dark h1 { color: red; }", ID, "tree")).toContain(`.dark h1${TREE} {`);
  });

  test("scopes rules inside @media", () => {
    const out = scopeCss("@media (max-width: 600px) { h1 { color: red; } }", ID, "tree");
    expect(out).toContain("@media (max-width: 600px) {");
    expect(out).toContain(`h1${TREE} {`);
  });

  test("leaves @keyframes untouched", () => {
    const css = "@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }";
    const out = scopeCss(css, ID, "tree");
    expect(out).toContain("@keyframes spin {");
    expect(out).toContain("from { transform: rotate(0); }");
    expect(out).not.toContain(ROOT);
  });
});

describe("scopeCss scoped mode", () => {
  test("uses the scoped filter that stops at child components", () => {
    expect(scopeCss(".t { color: red; }", ID, "scoped")).toBe(`.t${SCOPED} { color: red; }\n`);
  });

  test("@scoped block inside tree mode switches to scoped", () => {
    const out = scopeCss("h1 { color: red; } @scoped { h1 { color: blue; } }", ID, "tree");
    expect(out).toContain(`h1${TREE} { color: red; }`);
    expect(out).toContain(`h1${SCOPED} { color: blue; }`);
  });

  test("@scoped block inside @media is scoped", () => {
    const out = scopeCss("@media print { @scoped { h1 { color: red; } } }", ID, "tree");
    expect(out).toContain("@media print {");
    expect(out).toContain(`h1${SCOPED} {`);
  });
});

describe("scopeCss global mode", () => {
  test("leaves selectors unscoped", () => {
    expect(scopeCss("body { margin: 0; }", ID, "global")).toBe("body { margin: 0; }\n");
  });

  test("@global block inside tree mode is unscoped", () => {
    const out = scopeCss("h1 { color: red; } @global { body { margin: 0; } }", ID, "tree");
    expect(out).toContain(`h1${TREE} { color: red; }`);
    expect(out).toContain("body { margin: 0; }");
    expect(out).not.toContain("body:where");
  });

  test("@global block inside @media is unscoped", () => {
    const out = scopeCss("@media print { @global { body { margin: 0; } } }", ID, "tree");
    expect(out).toContain("@media print {");
    expect(out).toContain("body { margin: 0; }");
  });
});

describe("inline :global()", () => {
  test(":global(body) is unscoped", () => {
    expect(scopeCss(":global(body) { margin: 0; }", ID, "tree")).toBe("body { margin: 0; }\n");
  });

  test(".card :global(a) scopes .card and leaves a global", () => {
    expect(scopeCss(".card :global(a) { color: red; }", ID, "tree")).toContain(`.card${TREE} a {`);
  });

  test(":global(.dark) .title keeps the subject scoped", () => {
    expect(scopeCss(":global(.dark) .title { color: red; }", ID, "tree")).toContain(`.dark .title${TREE} {`);
  });

  test("nested parens inside :global() are unwrapped", () => {
    expect(scopeCss(":global(a:is(.x, .y)) { color: red; }", ID, "tree")).toContain("a:is(.x, .y) {");
  });

  test("nested parens inside :global() keep the scoped part", () => {
    expect(scopeCss(":global(a:is(.x, .y)) .t { color: red; }", ID, "tree")).toContain(`a:is(.x, .y) .t${TREE} {`);
  });
});

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

// happy-dom ignores :where() with complex selectors and mis-evaluates :not() with them, so these skip until it does.
describe.skip("selectors match the DOM (needs :where support in happy-dom)", () => {
  function selectorOf(css: string, mode: "tree" | "scoped"): string {
    const out = scopeCss(css, ID, mode);
    return out.slice(0, out.indexOf(" {"));
  }

  function build(): { parent: Element; parentH1: Element; childH1: Element; top: Element } {
    const host = document.createElement("section");
    host.innerHTML = `<div data-l="p"><h1 class="t"></h1><div data-l="c"><h1 class="t"></h1></div></div>`;
    const parent = host.firstElementChild!;
    const [parentH1, childBox] = [...parent.children];
    const childH1 = childBox!.firstElementChild!;
    const top = document.createElement("h1");
    top.setAttribute("data-l", "p");
    top.className = "t";
    return { parent, parentH1: parentH1!, childH1, top };
  }

  test("tree selector matches the parent's h1 and the child's h1", () => {
    const selector = selectorOf(".t { color: red; }", "tree");
    const { parentH1, childH1 } = build();
    expect(parentH1.matches(selector)).toBe(true);
    expect(childH1.matches(selector)).toBe(true);
  });

  test("scoped selector matches only the parent's h1", () => {
    const selector = selectorOf(".t { color: red; }", "scoped");
    const { parentH1, childH1 } = build();
    expect(parentH1.matches(selector)).toBe(true);
    expect(childH1.matches(selector)).toBe(false);
  });

  test("a top-level element matches in both modes", () => {
    const { top } = build();
    expect(top.matches(selectorOf(".t { color: red; }", "tree"))).toBe(true);
    expect(top.matches(selectorOf(".t { color: red; }", "scoped"))).toBe(true);
  });
});
