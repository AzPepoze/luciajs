export type Variant = "A" | "B" | "C";

export const VARIANTS: Variant[] = ["A", "B", "C"];
export const DEFAULT_N = 1000;
export const DEFAULT_R = 300;
export const STAMP_ATTR = "data-l-s";

export interface Rule {
  selector: string;
  body: string;
}

export interface BenchPage {
  head: string;
  body: string;
  css: string;
}

// Seeded PRNG so every variant gets the same DOM and class map.
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIXED_RULES: Rule[] = [
  { selector: "h1", body: "color: rgb(10, 20, 30); font-weight: 700;" },
  { selector: ".status", body: "padding: 4px 8px; border: 1px solid #ccc;" },
  { selector: ".hint", body: "margin: 2px 0; font-weight: 300;" },
  { selector: "button", body: "padding: 6px 12px; border: 1px solid #333;" },
  { selector: ".btn", body: "border-width: 2px;" },
  { selector: "li a", body: "padding: 2px; border-bottom: 1px dotted #999;" },
  { selector: "span", body: "color: rgb(1, 2, 3);" },
];

// Mode rules apply to a target under body.mode-b, toggled by the restyle benchmark.
interface ModeRule {
  target: string;
  body: string;
}

const MODE_RULES: ModeRule[] = [
  { target: "h1", body: "font-weight: 800;" },
  { target: "p", body: "letter-spacing: 1px;" },
  ...Array.from({ length: 10 }, (_, k): ModeRule => ({
    target: `.rule${k}`,
    body: "margin-left: 3px;",
  })),
];

function randomRuleBody(k: number): string {
  const declarations = [
    `padding: ${2 + (k % 7)}px ${4 + (k % 5)}px;`,
    `font-weight: ${[300, 400, 500, 600, 700][k % 5]};`,
    `border: ${1 + (k % 3)}px solid rgb(${k % 256}, ${(k * 7) % 256}, ${(k * 13) % 256});`,
    `margin-top: ${k % 9}px;`,
  ];
  return declarations[k % 4] + " " + declarations[(k + 1) % 4];
}

function randomRules(R: number): Rule[] {
  return Array.from({ length: R }, (_, k): Rule => ({
    selector: `.rule${k}`,
    body: randomRuleBody(k),
  }));
}

// Variant B appends the shared stamp to the last compound selector.
function emitRule(variant: Variant, rule: Rule): string {
  const selector = variant === "B" ? `${rule.selector}[${STAMP_ATTR}]` : rule.selector;
  return `${selector} { ${rule.body} }`;
}

// Inside @scope a selector is implicitly `:scope <selector>`, and body is outside the scope root, so variant C names :scope explicitly.
function emitModeRule(variant: Variant, rule: ModeRule): string {
  const ancestor = variant === "C" ? ".mode-b :scope" : ".mode-b";
  const target = variant === "B" ? `${rule.target}[${STAMP_ATTR}]` : rule.target;
  return `${ancestor} ${target} { ${rule.body} }`;
}

function buildCss(variant: Variant, R: number): string {
  const lines = [
    ...[...FIXED_RULES, ...randomRules(R)].map((rule) => emitRule(variant, rule)),
    ...MODE_RULES.map((rule) => emitModeRule(variant, rule)),
  ];
  if (variant === "C") {
    // The scope start must skip child roots, or each child root becomes its own scope and the donut stop is bypassed.
    return `@scope ([data-l]:not([data-l="child"])) to ([data-l="child"]) {\n${lines.join("\n")}\n}\n`;
  }
  return lines.join("\n") + "\n";
}

function pickRuleClasses(rng: () => number, R: number): string[] {
  return [0, 1].map(() => `rule${Math.floor(rng() * R)}`);
}

function classAttr(names: string[]): string {
  return ` class="${names.join(" ")}"`;
}

function componentHtml(k: number, stamp: string, rng: () => number, R: number): string {
  const picked = () => classAttr(pickRuleClasses(rng, R));
  const items = Array.from({ length: 5 }, (_, i) => {
    const link = `<a${stamp}${picked()} href="#c${k}-${i}">Item ${i}</a>`;
    return `<li${stamp}>${link}</li>`;
  }).join("");

  return [
    `<div data-l="c${k}"${stamp}>`,
    `<h1${stamp}${picked()}>Component ${k}</h1>`,
    `<p${stamp} class="status ${pickRuleClasses(rng, R).join(" ")}">Ready</p>`,
    `<p${stamp} class="hint ${pickRuleClasses(rng, R).join(" ")}">Hint text</p>`,
    `<button${stamp} class="btn add ${pickRuleClasses(rng, R).join(" ")}">Add</button>`,
    `<button${stamp} class="btn reset ${pickRuleClasses(rng, R).join(" ")}">Reset</button>`,
    `<button${stamp} class="btn ${pickRuleClasses(rng, R).join(" ")}">Go</button>`,
    `<ul${stamp}>${items}</ul>`,
    `<div data-l="child"${stamp}><span${stamp}>child ${k}</span></div>`,
    `</div>`,
  ].join("");
}

function buildBody(variant: Variant, N: number, R: number): string {
  const stamp = variant === "B" ? ` ${STAMP_ATTR}` : "";
  const rng = mulberry32(42);
  const components = Array.from({ length: N }, (_, k) => componentHtml(k, stamp, rng, R));
  return components.join("\n");
}

export function buildPage(variant: Variant, N = DEFAULT_N, R = DEFAULT_R): BenchPage {
  const css = buildCss(variant, R);
  const head = `<!doctype html><html><head><meta charset="utf-8"><style>\n${css}</style></head><body></body></html>`;
  return { head, body: buildBody(variant, N, R), css };
}
