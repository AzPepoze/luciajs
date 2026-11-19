import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, firefox, type Browser, type BrowserType, type Page } from "playwright";
import { DEFAULT_N, DEFAULT_R, VARIANTS, buildPage, type Variant } from "./generate.ts";

const RUNS = 10;
const TOGGLES = 50;
const CHROMIUM_PATH = "/usr/bin/chromium";
const EXPECTED_H1_COLOR = "rgb(10, 20, 30)";
const SPAN_COLOR = "rgb(1, 2, 3)";
const MODE_FONT_WEIGHT = "800";
const MODE_LETTER_SPACING = "1px";

interface Style {
  fontWeight: string;
  letterSpacing: string;
}

interface RunSample {
  initial: number;
  restyle: number;
  h1Color: string;
  childSpanColor: string;
  modeBefore: Style;
  modeOn: Style;
  modeAfter: Style;
}

interface Row {
  browser: string;
  variant: Variant;
  initialMedian: number;
  initialP90: number;
  restyleMedian: number;
  restyleP90: number;
  cssBytes: number;
}

interface Check {
  browser: string;
  variant: Variant;
  status: "pass" | "FAIL";
  detail: string;
}

interface BrowserRun {
  name: string;
  version: string;
  rows: Row[];
  checks: Check[];
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

// Nearest-rank 90th percentile.
function p90(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(0.9 * sorted.length) - 1]!;
}

async function measureOnce(page: Page, head: string, body: string): Promise<RunSample> {
  await page.setContent(head);
  return page.evaluate(
    ({ body, toggles }) => {
      const root = document.body;
      const flush = () => void root.offsetHeight;
      const readStyle = () => {
        const h1 = document.querySelector('[data-l="c0"] h1')!;
        const p = document.querySelector('[data-l="c0"] p')!;
        return {
          fontWeight: getComputedStyle(h1).fontWeight,
          letterSpacing: getComputedStyle(p).letterSpacing,
        };
      };

      const start = performance.now();
      root.innerHTML = body;
      flush();
      const lastH1 = document.querySelectorAll("h1");
      getComputedStyle(lastH1[lastH1.length - 1]!).color;
      const initial = performance.now() - start;

      const h1Color = getComputedStyle(document.querySelector('[data-l="c0"] h1')!).color;
      const span = document.querySelector('[data-l="c0"] [data-l="child"] span')!;
      const childSpanColor = getComputedStyle(span).color;

      // Mode check runs before the timed loop, so the loop starts with mode-b off.
      const modeBefore = readStyle();
      root.classList.add("mode-b");
      flush();
      const modeOn = readStyle();
      root.classList.remove("mode-b");
      flush();
      const modeAfter = readStyle();

      const restyleStart = performance.now();
      for (let i = 0; i < toggles; i++) {
        root.classList.toggle("mode-b");
        flush();
      }
      const restyle = performance.now() - restyleStart;

      return { initial, restyle, h1Color, childSpanColor, modeBefore, modeOn, modeAfter };
    },
    { body, toggles: TOGGLES },
  );
}

// Returns the list of failed checks for one run. Empty means pass.
function failures(variant: Variant, sample: RunSample): string[] {
  const problems: string[] = [];
  if (sample.h1Color !== EXPECTED_H1_COLOR) problems.push(`h1 color ${sample.h1Color}`);

  const spanShouldBeStyled = variant !== "C";
  const spanIsStyled = sample.childSpanColor === SPAN_COLOR;
  if (spanIsStyled !== spanShouldBeStyled) problems.push(`child span color ${sample.childSpanColor}`);

  if (sample.modeOn.fontWeight !== MODE_FONT_WEIGHT) problems.push(`mode-b h1 font-weight ${sample.modeOn.fontWeight}`);
  if (sample.modeOn.letterSpacing !== MODE_LETTER_SPACING) problems.push(`mode-b p letter-spacing ${sample.modeOn.letterSpacing}`);
  if (sample.modeAfter.fontWeight !== sample.modeBefore.fontWeight) problems.push(`mode-b off h1 font-weight ${sample.modeAfter.fontWeight}`);
  if (sample.modeAfter.letterSpacing !== sample.modeBefore.letterSpacing) problems.push(`mode-b off p letter-spacing ${sample.modeAfter.letterSpacing}`);
  return problems;
}

async function benchBrowser(name: string, launcher: BrowserType, options: object): Promise<BrowserRun> {
  const browser: Browser = await launcher.launch(options);
  const version = browser.version();
  const rows: Row[] = [];
  const checks: Check[] = [];
  try {
    const context = await browser.newContext();
    for (const variant of VARIANTS) {
      const { head, body, css } = buildPage(variant, DEFAULT_N, DEFAULT_R);

      // Warm-up run, not counted, so JIT and first-load costs do not land on variant A.
      const warm = await context.newPage();
      await measureOnce(warm, head, body);
      await warm.close();

      const samples: RunSample[] = [];
      for (let i = 0; i < RUNS; i++) {
        const page = await context.newPage();
        samples.push(await measureOnce(page, head, body));
        await page.close();
      }

      const problems = samples.flatMap((sample, i) => failures(variant, sample).map((p) => `run ${i + 1}: ${p}`));
      if (problems.length > 0) {
        checks.push({ browser: name, variant, status: "FAIL", detail: `${problems.length} failed, first: ${problems[0]}` });
        continue;
      }
      checks.push({ browser: name, variant, status: "pass", detail: `all ${RUNS} runs` });

      const initialTimes = samples.map((s) => s.initial);
      const restyleTimes = samples.map((s) => s.restyle);
      rows.push({
        browser: name,
        variant,
        initialMedian: median(initialTimes),
        initialP90: p90(initialTimes),
        restyleMedian: median(restyleTimes),
        restyleP90: p90(restyleTimes),
        cssBytes: Buffer.byteLength(css, "utf8"),
      });
    }
  } finally {
    await browser.close();
  }
  return { name, version, rows, checks };
}

const fmt = (ms: number) => ms.toFixed(1);

function table(rows: Row[]): string {
  const header = [
    "| browser | variant | initial median/p90 (ms) | restyle median/p90 (ms, 50 toggles) | CSS bytes |",
    "|---|---|---|---|---|",
  ];
  const body = rows.map(
    (r) =>
      `| ${r.browser} | ${r.variant} | ${fmt(r.initialMedian)} / ${fmt(r.initialP90)} | ${fmt(r.restyleMedian)} / ${fmt(r.restyleP90)} | ${r.cssBytes} |`,
  );
  return [...header, ...body].join("\n");
}

function checkTable(checks: Check[]): string {
  const header = ["| browser | variant | status | detail |", "|---|---|---|---|"];
  const body = checks.map((c) => `| ${c.browser} | ${c.variant} | ${c.status} | ${c.detail} |`);
  return [...header, ...body].join("\n");
}

async function main() {
  const runs: BrowserRun[] = [];

  runs.push(await benchBrowser("Chromium", chromium, { executablePath: CHROMIUM_PATH }));

  try {
    runs.push(await benchBrowser("Firefox", firefox, {}));
  } catch (error) {
    console.error(`Firefox skipped: ${(error as Error).message.split("\n")[0]}`);
  }

  const rows = runs.flatMap((r) => r.rows);
  const checks = runs.flatMap((r) => r.checks);
  const versions = runs.map((r) => `  - ${r.name}: ${r.version}`).join("\n");
  const date = new Date().toISOString().slice(0, 10);
  const report = [
    "# Selector-scoping benchmark results",
    "",
    `- Date: ${date}`,
    `- Elements per page: N = ${DEFAULT_N} components (~${DEFAULT_N * 20} elements)`,
    `- Rules: R = ${DEFAULT_R} random class rules plus fixed rules`,
    `- Runs: ${RUNS} per browser and variant (plus one unmeasured warm-up)`,
    `- Restyle: ${TOGGLES} body class toggles, forced style after each`,
    "- Browser versions:",
    versions,
    "",
    "## Fixes to the first draft",
    "",
    '- Variant C scope start is `([data-l]:not([data-l="child"]))`. A plain `([data-l])` made each child root its own scope root, so the child span was still styled.',
    "- Variant C mode rules are `.mode-b :scope <target>`. Inside `@scope`, a selector with no `:scope` or `&` is implicitly prefixed with `:scope `, so `.mode-b h1` never matched (body is outside the scope root). The first draft's C restyle numbers were invalid and are discarded.",
    "",
    "## Results",
    "",
    "Only variants where every run passes all checks appear here.",
    "",
    table(rows),
    "",
    "## Correctness checks",
    "",
    "Per run: h1 color; child span styled in A and B, not in C; `body.mode-b` sets h1 font-weight 800 and p letter-spacing 1px; both revert when the class is removed.",
    "",
    checkTable(checks),
    "",
  ].join("\n");

  console.log(report);
  writeFileSync(join(import.meta.dir, "RESULTS.md"), report);
}

await main();
