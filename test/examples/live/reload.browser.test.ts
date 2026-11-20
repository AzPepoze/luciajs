import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { chromium, type Browser, type ElementHandle, type Locator, type Page } from "playwright";
import type { BunFile } from "bun";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const SITE = join(ROOT, "docs");
const BUILD_TIMEOUT_MS = 120_000;
const TEST_TIMEOUT_MS = 30_000;
// A new frame stays pending until it has mounted. The shown one is the one that is not pending.
const SHOWN_FRAME = "iframe.preview-frame:not(.is-pending)";

const launch = await chromium
  .launch({ executablePath: process.env.LUSIA_CHROMIUM || undefined })
  .then((browser) => ({ browser, reason: "" }))
  .catch((error: Error) => ({ browser: null, reason: error.message.split("\n")[0] }));
const browser: Browser | null = launch.browser;
const suite = browser ? describe : describe.skip;

let server: Server | undefined;
let base = "";

async function runBun(args: string[]): Promise<void> {
  const proc = Bun.spawn(["bun", ...args], { cwd: ROOT, stdout: "ignore", stderr: "pipe" });
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`bun ${args.join(" ")} failed: ${await Bun.readableStreamToText(proc.stderr)}`);
  }
}

// The first file that exists: the path itself, then its index.html.
async function findFile(out: string, path: string): Promise<BunFile | null> {
  for (const candidate of [join(out, path), join(out, path, "index.html")]) {
    const file = Bun.file(candidate);
    if (await file.exists()) return file;
  }
  return null;
}

function serveFolder(out: string): Server {
  return createServer(async (request, response) => {
    const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    const file = await findFile(out, path);
    if (!file) {
      response.statusCode = 404;
      response.end();
      return;
    }
    response.setHeader("content-type", file.type);
    response.end(Buffer.from(await file.arrayBuffer()));
  });
}

// Builds the web example into a temp folder and serves it, as the static site would be served.
async function serveSite(): Promise<void> {
  const out = await mkdtemp(join(tmpdir(), "lusia-reload-"));
  await runBun(["scripts/playground-runtime.ts"]);
  await runBun(["src/cli/index.ts", "build", SITE, "--outdir", out, "--routes", "/guide"]);
  server = serveFolder(out);
  await new Promise<void>((resolve) => server!.listen(0, "localhost", resolve));
  const address = server.address() as AddressInfo;
  base = `http://localhost:${address.port}`;
}

beforeAll(async () => {
  if (browser) await serveSite();
}, BUILD_TIMEOUT_MS);

afterAll(async () => {
  await browser?.close();
  server?.close();
});

async function openDemo(page: Page, id: string): Promise<Locator> {
  await page.goto(`${base}/guide`);
  const block = page.locator(`#${id}`);
  await block.scrollIntoViewIfNeeded();
  return block;
}

async function isConnected(handle: ElementHandle): Promise<boolean> {
  return await handle.evaluate((node) => node.isConnected);
}

suite("reload button on a Guide demo", () => {
  test(
    "a normal demo starts over with a fresh instance",
    async () => {
      const page = await browser!.newPage();
      const block = await openDemo(page, "event-handlers");
      await block.locator(".status", { hasText: "Clicked 0 of 5 times." }).waitFor();
      await block.locator(".add").click();
      await block.locator(".add").click();
      await block.locator(".status", { hasText: "Clicked 2 of 5 times." }).waitFor();
      const before = await block.locator(".events").elementHandle();

      await block.getByRole("button", { name: "Run again" }).click();

      await block.locator(".status", { hasText: "Clicked 0 of 5 times." }).waitFor();
      expect(await isConnected(before!)).toBe(false);
      await page.close();
    },
    TEST_TIMEOUT_MS,
  );

  test(
    "an edited demo runs its edited code again in a new frame",
    async () => {
      const page = await browser!.newPage();
      const block = await openDemo(page, "event-handlers");
      await block.locator(".cm-content").click();
      await page.keyboard.press("Control+End");
      await page.keyboard.type(" ");
      const frame = block.frameLocator(SHOWN_FRAME);
      await frame.locator(".status", { hasText: "Clicked 0 of 5 times." }).waitFor();
      await frame.locator(".add").click();
      await frame.locator(".add").click();
      await frame.locator(".status", { hasText: "Clicked 2 of 5 times." }).waitFor();
      const before = await block.locator(SHOWN_FRAME).elementHandle();

      await block.getByRole("button", { name: "Run again" }).click();

      await block
        .frameLocator(SHOWN_FRAME)
        .locator(".status", { hasText: "Clicked 0 of 5 times." })
        .waitFor();
      expect(await isConnected(before!)).toBe(false);
      await page.close();
    },
    TEST_TIMEOUT_MS,
  );
});
