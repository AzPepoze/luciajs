import { ANSI, paint } from "../log/color.ts";
import { formatTable } from "./report.ts";

export type Step = "wait" | "compile" | "sass" | "bundle" | "send" | "write" | "copy" | "total";
export type Steps = Partial<Record<Step, number>>;

const REBUILD_STEPS: Step[] = ["wait", "sass", "compile", "bundle", "send"];
const BUILD_STEPS: [Step, string][] = [
  ["compile", "compile"],
  ["sass", "sass"],
  ["bundle", "bundle"],
  ["write", "write"],
  ["copy", "copy public"],
  ["total", "total"],
];

export function now(): number {
  return performance.now();
}

export function addStep(steps: Steps, step: Step, ms: number): void {
  steps[step] = (steps[step] ?? 0) + ms;
}

export function formatMs(ms: number): string {
  return ms < 10 ? ms.toFixed(1) : Math.round(ms).toString();
}

/** `rebuilt in 232 ms  wait 15 · sass 3 · compile 1 · bundle 8 · send 0.2  (css swap)` */
export function formatRebuild(steps: Steps, update: string, color: boolean): string {
  const separator = styled(" · ", ANSI.dim, color);
  const parts = REBUILD_STEPS.map(
    (step) => `${styled(step, ANSI.dim, color)} ${formatMs(steps[step] ?? 0)}`,
  );
  const total = styled(`${formatMs(steps.total ?? 0)} ms`, ANSI.bold, color);
  const mode = styled(`(${update})`, ANSI.cyan, color);
  return `rebuilt in ${total}  ${parts.join(separator)}  ${mode}`;
}

export function formatBrowserReady(ms: number, color: boolean): string {
  return `browser ready in ${styled(`${formatMs(ms)} ms`, ANSI.bold, color)}`;
}

export function formatBuildSteps(steps: Steps): string {
  const rows = [
    ["Step", "Time"],
    ...BUILD_STEPS.map(([step, label]) => [label, `${formatMs(steps[step] ?? 0)} ms`]),
  ];
  return formatTable(rows);
}

function styled(text: string, code: string, color: boolean): string {
  return color ? paint(text, code) : text;
}

/** Bundle time is the bundler's own work: the whole build minus the plugin's compile and Sass time. */
export function addBundleStep(steps: Steps, buildMs: number): void {
  addStep(steps, "bundle", buildMs - (steps.compile ?? 0) - (steps.sass ?? 0));
}
