import { describe, expect, test } from "bun:test";
import { ELEMENT_MARKER } from "lucia/markers";
import { compileTemplate } from "@compiler/template/scanner.ts";

const FILE = "Card.lucia";

describe("animate attribute", () => {
  test("animate becomes the element's animate expression and its marker", () => {
    const { html, bindings } = compileTemplate("<div animate={frames}>Hi</div>", FILE);
    expect(html).toBe(`<div ${ELEMENT_MARKER}>Hi</div>`);
    expect(bindings).toEqual([{ kind: "element", attrs: [], events: [], binds: [], animate: "frames" }]);
  });

  test("other attributes next to animate are plain bindings on the same element", () => {
    const { html, bindings } = compileTemplate("<div animate={frames} duration={400}>Hi</div>", FILE);
    expect(html).toBe(`<div ${ELEMENT_MARKER}>Hi</div>`);
    expect(bindings).toEqual([
      {
        kind: "element",
        attrs: [{ name: "duration", parts: [{ expr: "400" }] }],
        events: [],
        binds: [],
        animate: "frames",
      },
    ]);
  });

  test("option-like names are ordinary attributes, with or without animate", () => {
    const plain = compileTemplate("<div duration={400} once onview>Hi</div>", FILE);
    expect(plain.html).toBe(`<div once onview ${ELEMENT_MARKER}>Hi</div>`);
    expect(plain.bindings).toEqual([
      { kind: "element", attrs: [{ name: "duration", parts: [{ expr: "400" }] }], events: [], binds: [] },
    ]);

    const animated = compileTemplate("<p animate={a} once onview loop={3}>x</p>", FILE);
    expect(animated.html).toBe(`<p once onview ${ELEMENT_MARKER}>x</p>`);
    expect(animated.bindings).toEqual([
      {
        kind: "element",
        attrs: [{ name: "loop", parts: [{ expr: "3" }] }],
        events: [],
        binds: [],
        animate: "a",
      },
    ]);
  });

  test("dynamic attributes on the same element share one binding", () => {
    const { html, bindings } = compileTemplate('<a href="/x" title={t} animate={a}>x</a>', FILE);
    expect(html).toBe(`<a href="/x" ${ELEMENT_MARKER}>x</a>`);
    expect(bindings).toEqual([
      {
        kind: "element",
        attrs: [{ name: "title", parts: [{ expr: "t" }] }],
        events: [],
        binds: [],
        animate: "a",
      },
    ]);
  });

  test("a static animate value is an error", () => {
    expect(() => compileTemplate('<div animate="fade">x</div>', FILE)).toThrow("animate needs {keyframes}");
  });

  test("two animate attributes on one element are an error", () => {
    expect(() => compileTemplate("<div animate={a} animate={b}>x</div>", FILE)).toThrow(
      "an element can have only one animate",
    );
  });

  test("an animate on a component tag stays a prop", () => {
    const { bindings } = compileTemplate("<badge animate={a} />", FILE, 1, new Set(["badge"]));
    expect(bindings).toEqual([{ kind: "component", name: "badge", props: [{ name: "animate", parts: [{ expr: "a" }] }] }]);
  });
});
