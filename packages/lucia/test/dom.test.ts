import { describe, expect, test } from "bun:test";
import { attr, injectStyle, listen, text } from "../src/dom.ts";
import { signal } from "../src/signal.ts";

describe("text", () => {
  test("updates when the signal changes", () => {
    const count = signal(0);
    const cleanups: Array<() => void> = [];
    const node = text(() => count.value, cleanups);
    expect(node.data).toBe("0");

    count.value = 3;
    expect(node.data).toBe("3");

    for (const cleanup of cleanups) cleanup();
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
