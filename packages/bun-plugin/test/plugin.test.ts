import { afterEach, describe, expect, test } from "bun:test";
import { compile } from "@lucia/compiler";
import { clicks } from "../../../examples/web/src/store.ts";

const COUNTER_PATH = "../../../examples/web/src/components/Counter.lucia";
const COUNTER_FILE = new URL(COUNTER_PATH, import.meta.url).pathname;

type Attached = { detach(): void };
let attached: Attached | null = null;

afterEach(() => {
  attached?.detach();
  attached = null;
  clicks.value = 0;
});

async function attachCounter(): Promise<{ target: HTMLElement; id: string }> {
  const source = await Bun.file(COUNTER_FILE).text();
  const { id } = compile(source, COUNTER_FILE);
  const Counter = (await import(COUNTER_PATH)).default as (target: Element) => Attached;
  const target = document.createElement("div");
  document.body.append(target);
  attached = Counter(target);
  return { target, id };
}

function click(target: HTMLElement, selector: string, times = 1): void {
  const button = target.querySelector(selector)!;
  for (let i = 0; i < times; i++) button.dispatchEvent(new Event("click"));
}

function textOf(target: HTMLElement, selector: string): string {
  return target.querySelector(selector)!.textContent!.replace(/\s+/g, " ").trim();
}

describe("lucia bun plugin with the web example's Counter", () => {
  test("stamps only the top-level element and injects compiled scss", async () => {
    const { target, id } = await attachCounter();
    expect(target.querySelector("section")!.getAttribute("data-l")).toBe(id);
    expect(target.querySelector("h2")!.hasAttribute("data-l")).toBe(false);
    expect(textOf(target, "h2")).toBe("Live demo");

    const css = document.querySelector(`style[data-lucia="${id}"]`)!.textContent!;
    expect(css).toContain(`h2:where([data-l="${id}"]`);
    expect(css).toContain("color: tomato");
  });

  test("text, partial and whole attributes follow signals", async () => {
    const { target } = await attachCounter();
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

  test("detach removes the nodes and stops updates", async () => {
    const { target } = await attachCounter();
    const status = target.querySelector(".status")!;
    attached!.detach();
    attached = null;
    expect(target.childNodes.length).toBe(0);

    clicks.value = 5;
    expect(status.textContent).toContain("Clicked 0");
    target.remove();
  });
});
