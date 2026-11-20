import { afterEach, describe, expect, test } from "bun:test";
import Raw from "./fixtures/Raw.lusia";
import { click, host, mount, resetMounts } from "./fixtures/mount.ts";

afterEach(resetMounts);

function rawHtml(el: HTMLElement): string {
  return el.querySelector(".raw")!.innerHTML;
}

describe("HTML", () => {
  test("the value is inserted as HTML, so its tags are elements", () => {
    const el = host();
    mount(Raw, el);

    expect(el.querySelector(".raw b")!.textContent).toBe("Bold");
    expect(rawHtml(el)).toContain("<b>Bold</b> text");
  });

  test("an update replaces the old nodes", () => {
    const el = host();
    mount(Raw, el);

    click(el, ".swap");

    expect(el.querySelector(".raw b")).toBeNull();
    expect(el.querySelector(".raw i")!.textContent).toBe("Italic");
  });

  test("null shows nothing", () => {
    const el = host();
    mount(Raw, el);

    click(el, ".clear");

    expect(el.querySelector(".raw")!.children.length).toBe(0);
    expect(el.querySelector(".raw")!.textContent!.trim()).toBe("");
  });

  test("detaching removes the HTML nodes", async () => {
    const el = host();
    const instance = mount(Raw, el);
    const bold = el.querySelector(".raw b")!;

    await instance.detach();

    expect(bold.isConnected).toBe(false);
  });
});
