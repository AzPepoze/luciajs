import { afterEach, describe, expect, test } from "bun:test";
import Slotted from "./fixtures/Slotted.lusia";
import { click, host, mount, resetMounts, text } from "./fixtures/mount.ts";

afterEach(resetMounts);

describe("CONTENT", () => {
  test("the children render where CONTENT is, in the parent's scope", () => {
    const el = host();
    mount(Slotted, el);

    const first = el.querySelector("section.card")!;
    expect(first.querySelector(".title")!.textContent).toBe("Hello");
    expect(first.querySelector(".count")!.textContent).toBe("0 clicks");
  });

  test("parent events and variables work inside the children", () => {
    const el = host();
    mount(Slotted, el);

    click(el, ".add");
    click(el, ".add");

    expect(text(el, ".count")).toBe("2 clicks");
  });

  test("a component without children renders nothing in CONTENT", () => {
    const el = host();
    mount(Slotted, el);

    const empty = el.querySelectorAll("section.card")[1]!;
    expect(empty.querySelector(".title")!.textContent).toBe("Empty");
    expect(empty.children.length).toBe(1);
  });

  test("children inside a block come and go with it", () => {
    const el = host();
    mount(Slotted, el);

    expect(el.querySelectorAll(".panel-count").length).toBe(1);
    click(el, ".toggle");
    expect(el.querySelectorAll(".panel").length).toBe(0);
    expect(el.querySelectorAll(".panel-count").length).toBe(0);
    click(el, ".toggle");
    expect(el.querySelector(".panel-count")!.textContent).toBe("0");
  });

  test("a block inside the children renders its rows", () => {
    const el = host();
    mount(Slotted, el);

    const items = [...el.querySelectorAll(".item")].map((item) => item.textContent);
    expect(items).toEqual(["a", "b"]);
  });

  test("detaching the parent removes the children and stops their updates", async () => {
    const el = host();
    const instance = mount(Slotted, el);
    const count = el.querySelector(".count")!;

    await instance.detach();
    expect(count.isConnected).toBe(false);
  });
});
