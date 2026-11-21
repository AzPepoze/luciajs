import { afterAll, describe, expect, test } from "bun:test";
import { chromium, type Browser, type Page } from "playwright";
import { fileURLToPath } from "node:url";

// An attach that opens its space needs real layout, so this runs in Chromium.
const launch = await chromium
  .launch({ executablePath: process.env.LUSIA_CHROMIUM || undefined })
  .then((browser) => ({ browser, reason: "" }))
  .catch((error: Error) => ({ browser: null, reason: error.message.split("\n")[0] }));
const browser: Browser | null = launch.browser;
afterAll(() => browser?.close());

const suite = browser ? describe : describe.skip;

async function bundledRuntime(): Promise<string> {
  const entry = fileURLToPath(new URL("./fixtures/detach-entry.ts", import.meta.url));
  const build = await Bun.build({ entrypoints: [entry], format: "iife", target: "browser" });
  if (!build.success) throw new Error(build.logs.map(String).join("\n"));
  return await build.outputs[0]!.text();
}

async function openPage(markup: string): Promise<Page> {
  const page = await browser!.newPage();
  await page.setContent(`<!doctype html><html><body>${markup}</body></html>`);
  await page.addScriptTag({ content: await bundledRuntime() });
  return page;
}

const ATTACH_LIST = `
  <style>body{margin:0}</style>
  <div id="list" style="display:flex;flex-direction:column;width:200px;row-gap:16px">
    <div id="before" style="height:40px"></div>
    <div id="after" style="height:40px"></div>
  </div>`;

/** Inserts `#gone` before `#after` with an ATTACH animation, and samples `#after`'s top for 700ms. */
async function attachSamples(page: Page, extraMore: string): Promise<number[]> {
  return await page.evaluate(async (moreText) => {
    const list = document.getElementById("list")!;
    const after = document.getElementById("after")!;
    const samples: number[] = [];
    const sample = () => samples.push(after.getBoundingClientRect().top);

    sample();
    const gone = document.createElement("div");
    gone.id = "gone";
    gone.style.height = "60px";
    gone.style.margin = "0";
    list.insertBefore(gone, after);

    const value = {
      style: { 0: { opacity: 0 }, 1: { opacity: 1 } },
      when: (window as any).lusiaWhen.ATTACH,
      duration: 400,
      more: JSON.parse(moreText),
    };
    (window as any).lusiaAnimate(gone, () => value, [], []);

    let running = true;
    const loop = () => {
      sample();
      if (running) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    await new Promise((resolve) => setTimeout(resolve, 700));
    running = false;
    sample();
    return samples;
  }, extraMore);
}

suite("ATTACH with animateSpace slides the siblings", () => {
  test("with animateSpace the sibling slides from its closed place to its open place", async () => {
    const page = await openPage(ATTACH_LIST);
    try {
      const tops = await attachSamples(page, '{"animateSpace":true}');
      const first = tops[0]!;
      const last = tops[tops.length - 1]!;
      expect(Math.abs(last - first - 76)).toBeLessThan(1.5);
      for (let i = 1; i < tops.length; i++)
        expect(tops[i]!).toBeGreaterThanOrEqual(tops[i - 1]! - 0.01);
      const middle = tops.filter((top) => top > first + 1 && top < last - 1);
      expect(middle.length).toBeGreaterThanOrEqual(3);
    } finally {
      await page.close();
    }
  });

  test("with animateSpace false the sibling jumps at once", async () => {
    const page = await openPage(ATTACH_LIST);
    try {
      const tops = await attachSamples(page, '{"animateSpace":false}');
      const first = tops[0]!;
      const last = tops[tops.length - 1]!;
      expect(Math.abs(last - first - 76)).toBeLessThan(1.5);
      const middle = tops.filter((top) => top > first + 1 && top < last - 1);
      expect(middle.length).toBe(0);
    } finally {
      await page.close();
    }
  });

  test("the element is shown at its own place while it appears", async () => {
    const page = await openPage(ATTACH_LIST);
    try {
      await attachSamples(page, '{"animateSpace":true}');
      const gap = await page.evaluate(() => {
        const gone = document.getElementById("gone")!;
        const before = document.getElementById("before")!;
        return gone.getBoundingClientRect().top - before.getBoundingClientRect().bottom;
      });
      expect(gap).toBeGreaterThanOrEqual(15);
    } finally {
      await page.close();
    }
  });
});
