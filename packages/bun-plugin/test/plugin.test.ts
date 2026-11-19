import { afterEach, describe, expect, test } from "bun:test";
import { compile } from "@lucia/compiler";

const APP_PATH = "../../../examples/basic/src/App.lucia";
const APP_FILE = new URL(APP_PATH, import.meta.url).pathname;

type Mounted = { destroy(): void };
let mounted: Mounted | null = null;

afterEach(() => {
  mounted?.destroy();
  mounted = null;
});

describe("lucia bun plugin", () => {
  test("loads .lucia files and mounts, styles, updates and destroys them", async () => {
    const source = await Bun.file(APP_FILE).text();
    const { scope } = compile(source, APP_FILE);
    const App = (await import(APP_PATH)).default as (target: Element) => Mounted;

    const target = document.createElement("div");
    document.body.append(target);
    mounted = App(target);

    const heading = target.querySelector("h1")!;
    expect(heading.hasAttribute(scope)).toBe(true);

    const style = document.querySelector(`style[data-lucia="${scope}"]`);
    expect(style).not.toBeNull();
    expect(style!.textContent).toContain(`h1[${scope}]`);
    expect(style!.textContent).toContain("color: tomato");

    const button = target.querySelector("button")!;
    const count = target.querySelector(".count")!;
    button.dispatchEvent(new Event("click"));
    expect(count.textContent).toBe("1");

    mounted.destroy();
    mounted = null;
    expect(target.querySelector("h1")).toBeNull();
    expect(target.querySelector("button")).toBeNull();

    target.remove();
  });
});
