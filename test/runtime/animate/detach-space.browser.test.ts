import { afterAll, describe, expect, test } from "bun:test";
import { chromium, type Browser, type Page } from "playwright";
import { fileURLToPath } from "node:url";

// A leave that closes its space needs real layout, so this runs in Chromium.
const launch = await chromium
  .launch({ executablePath: process.env.LUCIA_CHROMIUM || undefined })
  .then((browser) => ({ browser, reason: "" }))
  .catch((error: Error) => ({ browser: null, reason: error.message.split("\n")[0] }));
const browser: Browser | null = launch.browser;
afterAll(() => browser?.close());

const suite = browser ? describe : describe.skip;
const SKIP_HINT = `set LUCIA_CHROMIUM or run \`bunx playwright install chromium\` (${launch.reason})`;

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

/** Removes `#gone` with its DETACH animation, and samples the `axis` position of `#after` each frame until the removal. */
async function sampleLeave(page: Page, more: string, axis: "top" | "left"): Promise<number[]> {
  return await page.evaluate(
    async ([moreText, edge]) => {
      const gone = document.getElementById("gone")!;
      const after = document.getElementById("after")!;
      const more = moreText === "" ? undefined : JSON.parse(moreText);
      const value = {
        style: { 0: { opacity: 1 }, 1: { opacity: 0 } },
        when: (window as any).luciaWhen.DETACH,
        duration: 400,
        ...(more ? { more } : {}),
      };
      const cleanups: Array<() => void> = [];
      const leaves: Array<() => Promise<void>> = [];
      (window as any).luciaAnimate(gone, () => value, cleanups, leaves);
      const tops: number[] = [];
      const sampling = setInterval(() => tops.push(after.getBoundingClientRect()[edge]), 16);
      const done = (window as any).luciaLeaveThen(leaves, () => gone.remove());
      await done;
      clearInterval(sampling);
      tops.push(after.getBoundingClientRect()[edge]);
      return tops;
    },
    [more, axis] as const,
  );
}

const LIST = `
  <div id="list" style="display:flex;flex-direction:column;width:200px">
    <div id="before" style="height:40px"></div>
    <div id="gone" style="height:60px;margin:10px 0"></div>
    <div id="after" style="height:40px"></div>
  </div>`;

suite("DETACH closes the space it holds", () => {
  test("the sibling after a leaving row moves gradually, not in one jump", async () => {
    const page = await openPage(LIST);
    try {
      const tops = await sampleLeave(page, "", "top");
      const first = tops[0]!;
      const last = tops[tops.length - 1]!;
      expect(first - last).toBeCloseTo(80, 0);
      const middle = tops.filter((top) => top > last + 1 && top < first - 1);
      expect(middle.length).toBeGreaterThan(3);
    } finally {
      await page.close();
    }
  });

  test("keepSpace: true keeps the space until the row is removed, then the sibling jumps", async () => {
    const page = await openPage(LIST);
    try {
      const tops = await sampleLeave(page, '{"keepSpace":true}', "top");
      const first = tops[0]!;
      const last = tops[tops.length - 1]!;
      expect(first - last).toBeCloseTo(80, 0);
      const middle = tops.filter((top) => top > last + 1 && top < first - 1);
      expect(middle.length).toBe(0);
    } finally {
      await page.close();
    }
  });

  test("a row in a horizontal flex list closes its width", async () => {
    const page = await openPage(`
      <div id="list" style="display:flex;flex-direction:row;align-items:flex-start">
        <div id="gone" style="width:100px;height:30px;margin-right:20px"></div>
        <div id="after" style="width:50px;height:30px"></div>
      </div>`);
    try {
      const lefts = await sampleLeave(page, "", "left");
      const first = lefts[0]!;
      const last = lefts[lefts.length - 1]!;
      expect(first - last).toBeCloseTo(120, 0);
      expect(lefts.filter((left) => left > last + 1 && left < first - 1).length).toBeGreaterThan(3);
    } finally {
      await page.close();
    }
  });
});
