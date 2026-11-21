import type { LintLevel, LintRuleCode, LintRuleSettings, Severity } from "./types.ts";

export function lintLevel(
  code: LintRuleCode,
  severity: Severity,
  rules: LintRuleSettings | undefined,
): LintLevel {
  return rules?.[code] ?? (severity === "error" ? "error" : "warn");
}

export function severityOf(level: LintLevel): Severity {
  return level === "error" ? "error" : "warning";
}
