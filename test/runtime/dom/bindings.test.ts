import { describe, expect, test } from "bun:test";
import { attr, bindText, listen } from "@runtime/dom/bindings.ts";
import { TEXT_MARKER } from "@runtime/markers.ts";
import { signal } from "@runtime/signal/signal.ts";

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
