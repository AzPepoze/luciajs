import { describe, expect, test } from "bun:test";
import { attr, bindText, createTemplate, injectStyle, instantiate, listen } from "../src/dom.ts";
import { COMPONENT_ATTR, ELEMENT_MARKER, TEXT_MARKER } from "../src/markers.ts";
import { signal } from "../src/signal.ts";

describe("bindText", () => {
  test("replaces the marker and updates when the signal changes", () => {
    const count = signal(0);
    const cleanups: Array<() => void> = [];
    const parent = document.createElement("p");
    const marker = document.createComment(TEXT_MARKER);
    parent.append(marker);
    bindText(marker, () => count.value, cleanups);
    expect(parent.textContent).toBe("0");

    count.value = 3;
    expect(parent.textContent).toBe("3");
    expect(parent.childNodes.length).toBe(1);

    for (const cleanup of cleanups) cleanup();
  });
});

describe("createTemplate and instantiate", () => {
  test("binds in document order and strips markers", () => {
    const html = `<div ${ELEMENT_MARKER}><b><!--${TEXT_MARKER}--></b><!--${TEXT_MARKER}--></div>`;
    const compiled = createTemplate(html, "p");
    expect(compiled.paths).toEqual([[0], [0, 0, 0], [0, 1]]);

    const seen: string[] = [];
    const binders = [0, 1, 2].map((i) => (node: Node) => void seen.push(`${i}:${node.nodeName}`));
    const fragment = instantiate(compiled, binders, []);
    expect(seen).toEqual(["0:DIV", "1:#comment", "2:#comment"]);

    const div = fragment.firstChild as Element;
    expect(div.hasAttribute(ELEMENT_MARKER)).toBe(false);
  });

  test("stamps the component id only on top-level elements", () => {
    const html = `<h1>a</h1><div><h1>b</h1><p><span>c</span></p></div>text<!--${TEXT_MARKER}-->`;
    const fragment = instantiate(createTemplate(html, "p"), [() => {}], []);
    const topLevel = [...fragment.children];
    expect(topLevel.map((el) => el.getAttribute(COMPONENT_ATTR))).toEqual(["p", "p"]);
    expect(fragment.querySelectorAll(`[${COMPONENT_ATTR}]`).length).toBe(2);
    expect(fragment.querySelector("span")!.hasAttribute(COMPONENT_ATTR)).toBe(false);
  });
});

describe("attr", () => {
  test("null and false remove the attribute, true sets it empty", () => {
    const value = signal<unknown>("x");
    const el = document.createElement("div");
    const cleanups: Array<() => void> = [];
    attr(el, "data-flag", () => value.value, cleanups);
    expect(el.getAttribute("data-flag")).toBe("x");

    value.value = null;
    expect(el.hasAttribute("data-flag")).toBe(false);

    value.value = true;
    expect(el.getAttribute("data-flag")).toBe("");

    value.value = false;
    expect(el.hasAttribute("data-flag")).toBe(false);

    for (const cleanup of cleanups) cleanup();
  });
});

describe("listen", () => {
  test("handler is removed after cleanups run", () => {
    const button = document.createElement("button");
    const cleanups: Array<() => void> = [];
    let clicks = 0;
    listen(button, "click", () => clicks++, cleanups);

    button.dispatchEvent(new Event("click"));
    expect(clicks).toBe(1);

    for (const cleanup of cleanups) cleanup();
    button.dispatchEvent(new Event("click"));
    expect(clicks).toBe(1);
  });
});

describe("injectStyle", () => {
  test("adds one <style> per id", () => {
    injectStyle("dom-test-once", "p { color: red; }");
    injectStyle("dom-test-once", "p { color: blue; }");
    const styles = document.querySelectorAll('style[data-lucia="dom-test-once"]');
    expect(styles.length).toBe(1);
    expect(styles[0]!.textContent).toBe("p { color: red; }");
  });
});
