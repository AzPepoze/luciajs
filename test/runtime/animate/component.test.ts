import { afterEach, describe, expect, test } from "bun:test";
import { advance, useFakeClock } from "./clock.ts";
import { host, mount, resetMounts } from "../dom/fixtures/mount.ts";
import Fade from "./fixtures/Fade.lusia";
import Wrap from "./fixtures/Wrap.lusia";

useFakeClock();
afterEach(resetMounts);

describe("animate in a component", () => {
  test("detach waits for the leave, then removes the nodes", async () => {
    const el = host();
    const instance = mount(Fade, el);
    const box = el.querySelector(".box")!;
    advance(100);

    let removed = false;
    const detaching = instance.detach().then(() => (removed = true));
    advance(50);
    expect(removed).toBe(false);
    expect(box.isConnected).toBe(true);

    advance(60);
    await detaching;
    expect(removed).toBe(true);
    expect(box.isConnected).toBe(false);
  });

  test("a parent waits for the leave of its child", async () => {
    const el = host();
    const instance = mount(Wrap, el);
    const box = el.querySelector(".box")!;
    advance(100);

    const detaching = instance.detach();
    advance(50);
    expect(box.isConnected).toBe(true);
    advance(60);
    await detaching;
    expect(el.childNodes.length).toBe(0);
  });

  test("the animation sets the opacity while the component is shown", () => {
    const el = host();
    mount(Fade, el);
    const box = el.querySelector<HTMLElement>(".box")!;
    expect(box.style.opacity).toBe("0");
    advance(100);
    expect(box.style.opacity).toBe("1");
  });
});
