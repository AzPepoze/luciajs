import type { LintContext, LintFinding } from "../types.ts";

const NUMERIC_LINE = /\b(start|end)\s*:\s*-?\d/g;

export function scrollLines({ source }: LintContext): LintFinding[] {
  if (!source.includes("WHEN.SCROLL")) return [];
  return [...source.matchAll(NUMERIC_LINE)].map((match) => ({
    offset: match.index,
    code: "scroll-numeric-line",
    message: `${match[1]} takes SCROLL_AT or { element, window }, not a number`,
    severity: "error",
  }));
}
