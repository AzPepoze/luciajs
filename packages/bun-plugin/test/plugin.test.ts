import { afterEach, describe, expect, test } from "bun:test";
import { compile } from "@lucia/compiler";
import { clicks } from "../../../examples/basic/src/store.ts";

const APP_PATH = "../../../examples/basic/src/App.lucia";
const APP_FILE = new URL(APP_PATH, import.meta.url).pathname;

type Mounted = { destroy(): void };
let mounted: Mounted | null = null;

afterEach(() => {
  mounted?.destroy();
  mounted = null;
  clicks.value = 0;
});

async function mountApp(): Promise<{ target: HTMLElement; scope: string }> {
  const source = await Bun.file(APP_FILE).text();
  const { scope } = compile(source, APP_FILE);
  const App = (await import(APP_PATH)).default as (target: Element) => Mounted;
  const target = document.createElement("div");
  document.body.append(target);
  mounted = App(target);
  return { target, scope };
}

function click(target: HTMLElement, selector: string, times = 1): void {
  const button = target.querySelector(selector)!;
  for (let i = 0; i < times; i++) button.dispatchEvent(new Event("click"));
}

function textOf(target: HTMLElement, selector: string): string {
  return target.querySelector(selector)!.textContent!.replace(/\s+/g, " ").trim();
}

describe("lucia bun plugin with the basic example", () => {
  test("scopes markup and injects compiled scss", async () => {
    const { target, scope } = await mountApp();
    expect(target.querySelector("h1")!.hasAttribute(scope)).toBe(true);
    expect(textOf(target, "h1")).toBe("LuciaJS");

    const css = document.querySelector(`style[data-lucia="${scope}"]`)!.textContent!;
    expect(css).toContain(`h1[${scope}]`);
    expect(css).toContain("color: tomato");
    expect(css).toContain("body {");
  });

  test("text, partial and whole attributes follow signals", async () => {
    const { target } = await mountApp();
    const progress = target.querySelector("progress")!;
    const add = target.querySelector(".add")!;
    const reset = target.querySelector(".reset")!;

    expect(textOf(target, ".status")).toBe("Clicked 0 of 10 times. Double: 0.");
    expect(textOf(target, ".hint")).toBe("10 left");
    expect(progress.getAttribute("value")).toBe("0");
    expect(reset.hasAttribute("title")).toBe(false);

    click(target, ".add", 3);
    expect(textOf(target, ".status")).toBe("Clicked 3 of 10 times. Double: 6.");
    expect(reset.getAttribute("title")).toBe("Start again");

    click(target, ".add", 7);
    expect(target.querySelector(".status")!.getAttribute("class")).toBe("status done");
    expect(textOf(target, ".hint")).toBe("Limit reached");
    expect(add.hasAttribute("disabled")).toBe(true);

    click(target, ".reset");
    expect(add.hasAttribute("disabled")).toBe(false);
    expect(textOf(target, ".hint")).toBe("10 left");
  });

  test("destroy removes the nodes and stops updates", async () => {
    const { target } = await mountApp();
    const status = target.querySelector(".status")!;
    mounted!.destroy();
    mounted = null;
    expect(target.childNodes.length).toBe(0);

    clicks.value = 5;
    expect(status.textContent).toContain("Clicked 0");
    target.remove();
  });
});
