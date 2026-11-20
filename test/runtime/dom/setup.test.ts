import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { setup } from "lusia";
import CallSetup from "./fixtures/CallSetup.lusia";
import { events } from "./fixtures/log.ts";
import { click, host, mount, resetMounts, unmount } from "./fixtures/mount.ts";

beforeEach(() => {
  events.length = 0;
});

afterEach(resetMounts);

describe("setup", () => {
  test("returns its callback unchanged", () => {
    const hook = () => {};
    expect(setup(hook)).toBe(hook);
    expect(setup(42)).toBe(42);
  });

  test("a setup(...) call installs the hook and its cleanup", () => {
    const el = host();
    const instance = mount(CallSetup, el);
    const button = el.querySelector(".go")!;

    click(el, ".go");
    expect(events).toEqual(["click: 1-2"]);

    unmount(instance);
    button.dispatchEvent(new Event("click"));
    expect(events).toEqual(["click: 1-2"]);
  });
});
