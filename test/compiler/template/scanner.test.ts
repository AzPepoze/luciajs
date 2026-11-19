import { describe, expect, test } from "bun:test";
import { ELEMENT_MARKER, TEXT_MARKER } from "lucia/markers";
import { LuciaError } from "@compiler/errors.ts";
import { type Binding, compileTemplate } from "@compiler/template/scanner.ts";

const FILE = "Card.lucia";
const TEXT = `<!--${TEXT_MARKER}-->`;
const COMPONENTS = new Set(["badge"]);

function firstPart(binding: Binding): unknown {
  if (binding.kind === "text") return binding.expr;
  if (binding.kind === "element") return binding.attrs[0]!.parts[0];
  if (binding.kind === "component") return binding.props[0]!.parts[0];
  return undefined;
}

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
        events: [],
        binds: [],
      },
    ]);
  });

  test("bindings follow document order", () => {
    const { bindings } = compileTemplate("<div id={a}>{b}<span id={c} /></div>", FILE);
    expect(bindings.map(firstPart)).toEqual([
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

describe("compileTemplate component tags", () => {
  test("self-closing tag becomes a component marker with props", () => {
    const { html, bindings } = compileTemplate('<badge title={name} label="New" flag />', FILE, 1, COMPONENTS);
    expect(html).toBe(TEXT);
    expect(bindings).toEqual([
      {
        kind: "component",
        name: "badge",
        props: [
          { name: "title", parts: [{ expr: "name" }] },
          { name: "label", parts: ["New"] },
          { name: "flag", parts: [] },
        ],
      },
    ]);
  });

  test("tag with an empty close pair is a component", () => {
    const { html, bindings } = compileTemplate('<p><badge label="x"></badge></p>', FILE, 1, COMPONENTS);
    expect(html).toBe(`<p>${TEXT}</p>`);
    expect(bindings).toEqual([{ kind: "component", name: "badge", props: [{ name: "label", parts: ["x"] }] }]);
  });

  test("child content between open and close is an error", () => {
    const run = () => compileTemplate("<p>\n  <badge>hi</badge></p>", FILE, 1, COMPONENTS);
    expect(run).toThrow(LuciaError);
    expect(run).toThrow(`${FILE}:2:3: <badge> cannot have child content yet; use <badge />`);
  });

  test("lowercase component name matches the import name", () => {
    const { bindings } = compileTemplate("<badge />", FILE, 1, new Set(["badge"]));
    expect(bindings).toEqual([{ kind: "component", name: "badge", props: [] }]);
  });

  test("unknown tags stay plain HTML", () => {
    const { html, bindings } = compileTemplate('<card title="x" />', FILE, 1, COMPONENTS);
    expect(html).toBe('<card title="x" />');
    expect(bindings).toEqual([]);
  });

  test("a prop with text and an expression keeps both parts", () => {
    const { bindings } = compileTemplate('<badge label="{count} new" />', FILE, 1, COMPONENTS);
    expect(bindings).toEqual([
      { kind: "component", name: "badge", props: [{ name: "label", parts: [{ expr: "count" }, " new"] }] },
    ]);
  });
});
