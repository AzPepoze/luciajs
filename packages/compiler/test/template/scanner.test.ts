import { describe, expect, test } from "bun:test";
import { ELEMENT_MARKER, TEXT_MARKER } from "lucia/markers";
import { LuciaError } from "../../src/errors.ts";
import { compileTemplate } from "../../src/template/scanner.ts";

const FILE = "Card.lucia";
const TEXT = `<!--${TEXT_MARKER}-->`;

describe("compileTemplate", () => {
  test("static markup is unchanged", () => {
    const { html, bindings } = compileTemplate('<p class="a">Hi <!-- note --></p>', FILE);
    expect(html).toBe('<p class="a">Hi <!-- note --></p>');
    expect(bindings).toEqual([]);
  });

  test("text expressions become markers", () => {
    const { html, bindings } = compileTemplate("<p>Hi {name}, {a + b}</p>", FILE);
    expect(html).toBe(`<p>Hi ${TEXT}, ${TEXT}</p>`);
    expect(bindings).toEqual([
      { kind: "text", expr: "name" },
      { kind: "text", expr: "a + b" },
    ]);
  });

  test("braces and quotes inside expressions are skipped", () => {
    const { bindings } = compileTemplate("<p>{ { a: '}' }.a + `}` }</p>", FILE);
    expect(bindings).toEqual([{ kind: "text", expr: "{ a: '}' }.a + `}`" }]);
  });

  test("attribute expressions mark the element and keep static attributes", () => {
    const { html, bindings } = compileTemplate('<a href="/x" class="btn {kind}" title={label} hidden>go</a>', FILE);
    expect(html).toBe(`<a href="/x" hidden ${ELEMENT_MARKER}>go</a>`);
    expect(bindings).toEqual([
      {
        kind: "element",
        attrs: [
          { name: "class", parts: ["btn ", { expr: "kind" }] },
          { name: "title", parts: [{ expr: "label" }] },
        ],
      },
    ]);
  });

  test("bindings follow document order", () => {
    const { bindings } = compileTemplate("<div id={a}>{b}<span id={c} /></div>", FILE);
    expect(bindings.map((b) => (b.kind === "text" ? b.expr : b.attrs[0]!.parts[0]))).toEqual([
      { expr: "a" },
      "b",
      { expr: "c" },
    ]);
  });

  test("unclosed expression reports its line and column", () => {
    const run = () => compileTemplate("<p>\n  {oops</p>", FILE, 10);
    expect(run).toThrow(LuciaError);
    expect(run).toThrow(`${FILE}:11:3: unclosed {`);
  });

  test("empty expression is an error", () => {
    expect(() => compileTemplate("<p>{ }</p>", FILE)).toThrow("empty {}");
  });
});
